from pymongo import MongoClient
from neo4j import GraphDatabase


# ========================
# CONFIG NODE (ERD)
# ========================
NODE_CONFIG = {
    "experts": {
        "label": "Expert",
        "key": "expertID"
    },
    "enterprises": {
        "label": "Enterprise",
        "key": "enterpriseID"
    },
    "foundation": {           
        "label": "Foundation",
        "key": "FoundID"
    },
    "createFund": {           
        "label": "Funding",
        "key": "FoundID"
    },
    "projects": {
        "label": "Project",
        "key": "projectID"
    },
    "documents": {
        "label": "Document",
        "key": "docID"
    },
}


# ========================
# CONFIG RELATIONSHIP (ERD)
# ========================
RELATIONSHIP_CONFIG = [

    # Expert → Project (CREATE) — qua field createBy trong projects
    {
        "collection":   "projects",
        "from_label":   "Expert",
        "to_label":     "Project",
        "from_field":   "createBy",  
        "to_field":     "projectID",
        "from_key":     "expertID",
        "to_key":       "projectID",
        "rel_type":     "CREATE"
    },

    # Expert → Project (PARTICIPATE) — qua expertParticipate
    {
        "collection":   "expertParticipate",
        "from_label":   "Expert",
        "to_label":     "Project",
        "from_field":   "expertID",
        "to_field":     "projectID",
        "from_key":     "expertID",
        "to_key":       "projectID",
        "rel_type":     "PARTICIPATE"
    },

    # Enterprise → Project (GRANT) — qua grant
    {
        "collection":   "grant",
        "from_label":   "Enterprise",
        "to_label":     "Project",
        "from_field":   "enterpriseID",
        "to_field":     "projectID",
        "from_key":     "enterpriseID",
        "to_key":       "projectID",
        "rel_type":     "GRANT"
    },

    # Enterprise → Project (JOIN) — qua enterpriseParticipate
    {
        "collection":   "enterpriseParticipate",
        "from_label":   "Enterprise",
        "to_label":     "Project",
        "from_field":   "enterpriseID",
        "to_field":     "projectID",
        "from_key":     "enterpriseID",
        "to_key":       "projectID",
        "rel_type":     "JOIN"
    },

    # Document → Project (BELONG_TO) — field "contain" chứa projectID
    {
        "collection":   "documents",
        "from_label":   "Document",
        "to_label":     "Project",
        "from_field":   "docID",
        "to_field":     "contain",    
        "from_key":     "docID",
        "to_key":       "projectID",
        "rel_type":     "BELONG_TO"
    },

    # Foundation → Funding (CREATE_FUND) — cùng FoundID, cặp 1-1
    {
        "collection":   "createFund",
        "from_label":   "Foundation",
        "to_label":     "Funding",
        "from_field":   "FoundID",
        "to_field":     "FoundID",
        "from_key":     "FoundID",
        "to_key":       "FoundID",
        "rel_type":     "CREATE_FUND"
    },

    # Project → Funding (CALL_FUND) — field FoundID vừa thêm vào projects
    {
        "collection":   "projects",
        "from_label":   "Project",
        "to_label":     "Funding",
        "from_field":   "projectID",
        "to_field":     "FoundID",    
        "from_key":     "projectID",
        "to_key":       "FoundID",
        "rel_type":     "CALL_FUND"
    },
]


# ========================
# MAIN CLASS
# ========================
class MongoToNeo4jSync:

    def __init__(self,
                 mongo_uri="mongodb://admin:admin123@localhost:27017/",
                 db_name="mydb",
                 neo4j_uri="bolt://localhost:7687",
                 neo4j_user="neo4j",
                 neo4j_password="password"):

        self.mongo_client = MongoClient(mongo_uri)
        self.db = self.mongo_client[db_name]

        self.neo4j_driver = GraphDatabase.driver(
            neo4j_uri, auth=(neo4j_user, neo4j_password))

    def close(self):
        self.mongo_client.close()
        self.neo4j_driver.close()

    # ========================
    # SYNC ALL NODE
    # ========================
    def sync_nodes(self):

        print("🚀 SYNC NODES...")

        for col, cfg in NODE_CONFIG.items():
            if col not in self.db.list_collection_names():
                continue

            self.import_collection(
                collection_name=col,
                label=cfg["label"],
                key_field=cfg["key"]
            )

    # ========================
    # IMPORT COLLECTION → NODE
    # ========================
    def import_collection(self, collection_name, label, key_field):

        collection = self.db[collection_name]

        with self.neo4j_driver.session() as session:
            for doc in collection.find():

                if key_field not in doc:
                    continue

                node_id = doc[key_field]

                props = self._clean_props(doc)

                query = f"""
                MERGE (n:{label} {{{key_field}: $id}})
                SET n += $props
                """

                session.run(query, id=node_id, props=props)

        print(f"✅ {collection_name} → {label}")

    # ========================
    # SYNC RELATIONSHIPS
    # ========================
    def sync_relationships(self):

        print("🚀 SYNC RELATIONSHIPS...")

        for cfg in RELATIONSHIP_CONFIG:
            self.create_relationship(cfg)

    # ========================
    # CREATE RELATIONSHIP
    # ========================
    def create_relationship(self, config):

        collection = self.db[config["collection"]]

        with self.neo4j_driver.session() as session:
            for doc in collection.find():

                from_id = doc.get(config["from_field"])
                to_id = doc.get(config["to_field"])

                if not from_id or not to_id:
                    continue

                query = f"""
                MATCH (a:{config['from_label']} {{{config['from_key']}: $from_id}})
                MATCH (b:{config['to_label']} {{{config['to_key']}: $to_id}})
                MERGE (a)-[:{config['rel_type']}]->(b)
                """

                session.run(query,
                            from_id=from_id,
                            to_id=to_id)

        print(f"🔗 {config['rel_type']} created")

    # ========================
    # FULL SYNC
    # ========================
    def sync_all(self):
        self.sync_nodes()
        self.sync_relationships()

    # ========================
    # UTIL
    # ========================
    def _clean_props(self, doc):

        clean = {}

        for k, v in doc.items():

            # bỏ _id
            if k == "_id":
                continue

            # ObjectId → string
            if str(type(v)).endswith("ObjectId'>"):
                clean[k] = str(v)

            # dict → string (Neo4j không thích nested)
            elif isinstance(v, dict):
                clean[k] = str(v)

            else:
                clean[k] = v

        return clean