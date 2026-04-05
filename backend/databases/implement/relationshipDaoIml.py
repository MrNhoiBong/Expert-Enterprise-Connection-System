from neo4j import GraphDatabase
from databases.interfaceDao.relationshipDao import RelationshipDAO
from databases.domain.relationship import Relationship


class RelationshipDAOImp(RelationshipDAO):

    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))
        self.database_info = "Neo4j - Relationship Storage"

    def close(self):
        self.driver.close()

    # ========================
    # CREATE RELATIONSHIP
    # ========================
    def create(self, rel: Relationship) -> str:
        """
        rel = {
            ids: [from_id, to_id],
            relationship: "PARTICIPATE",
            from_label: "Expert",
            to_label: "Project",
            from_key: "expertID",
            to_key: "projectID",
            props: {joinDate, role, status}
        }
        """

        with self.driver.session() as session:

            query = f"""
            MATCH (a:{rel.from_label} {{{rel.from_key}: $from_id}})
            MATCH (b:{rel.to_label} {{{rel.to_key}: $to_id}})
            MERGE (a)-[r:{rel.relationship}]->(b)
            SET r += $props
            """

            session.run(query,
                        from_id=rel.ids[0],
                        to_id=rel.ids[1],
                        props=rel.props or {})

        return "Create relationship success"

    # ========================
    # FIND RELATIONSHIP BY INTERNAL ID
    # ========================
    def find(self, id: str) -> Relationship:
        with self.driver.session() as session:
            query = """
            MATCH (a)-[r]->(b)
            WHERE id(r) = $id
            RETURN 
                labels(a)[0] AS from_label,
                labels(b)[0] AS to_label,
                properties(r) AS props,
                type(r) AS rel,
                a, b
            """

            result = session.run(query, id=int(id)).single()

            if result:
                return Relationship(
                    ids=[result["a"], result["b"]],
                    relationship=result["rel"],
                    props=result["props"]
                )

        return None

    # ========================
    # SEARCH RELATIONSHIP
    # ========================
    def search(self, criteria: dict) -> list:

        rel_type = criteria.get("relationship")
        from_label = criteria.get("from_label")
        to_label = criteria.get("to_label")

        # build dynamic query
        query = "MATCH (a"

        if from_label:
            query += f":{from_label}"

        query += ")-[r"

        if rel_type:
            query += f":{rel_type}"

        query += "]->(b"

        if to_label:
            query += f":{to_label}"

        query += ") RETURN a, r, b"

        with self.driver.session() as session:
            results = session.run(query)

            rels = []
            for r in results:
                rels.append(Relationship(
                    ids=[r["a"]["id"] if "id" in r["a"] else None,
                         r["b"]["id"] if "id" in r["b"] else None],
                    relationship=r["r"].type
                ))

            return rels

    # ========================
    # DELETE RELATIONSHIP
    # ========================
    def delete(self, rel: Relationship) -> str:
        with self.driver.session() as session:

            query = f"""
            MATCH (a:{rel.from_label} {{{rel.from_key}: $from_id}})
                  -[r:{rel.relationship}]->
                  (b:{rel.to_label} {{{rel.to_key}: $to_id}})
            DELETE r
            """

            session.run(query,
                        from_id=rel.ids[0],
                        to_id=rel.ids[1])

        return "Delete relationship success"

    # ========================
    def showinfo(self) -> str:
        return self.database_info