from pymongo import MongoClient

from databases.manageDatabase.manageDb import ManageDb
from databases.implement.dataDaoImp import DataDAOImp
from databases.implement.relationshipDaoIml import RelationshipDAOImp
from databases.manageDatabase.worker.mongoWorker import MongoWorker
from databases.manageDatabase.worker.neo4jWorker import Neo4jWorker
from connectMongoNeo import MongoToNeo4jSync

def main():
    # =========================
    # 1. SYNC MONGO → NEO4J
    # =========================
    print("\n🚀 SYNC MONGO → NEO4J...")

    sync = MongoToNeo4jSync(
        mongo_uri="mongodb://admin:admin123@localhost:27017/",
        db_name="mydb",
        neo4j_uri="bolt://localhost:7687",
        neo4j_user="neo4j",
        neo4j_password="password"
    )

    sync.sync_all()
    sync.close()

    print("✅ SYNC DONE\n")

    # =========================
    # 2. INIT DAO + WORKER
    # =========================

    # Neo4j
    neo4jDao = RelationshipDAOImp(
        uri="bolt://localhost:7687",
        user="neo4j",
        password="password"
    )
    neo4jWorker = Neo4jWorker(neo4jDao)

    # Mongo
    client = MongoClient("mongodb://admin:admin123@localhost:27017/")
    db = client["mydb"]

    print("📦 Collections:", db.list_collection_names())

    mongoDao = DataDAOImp(db)
    mongoWorker = MongoWorker(mongoDao)

    # =========================
    # 3. MANAGER
    # =========================
    manager = ManageDb()
    manager.addworker(mongoWorker)
    manager.addworker(neo4jWorker)

    # =========================
    # 4. RUN TEST
    # =========================

    print("\n===== DATABASE INFO =====")
    print(manager.notify("show_info"))

    print("\n===== MONGO DATA =====")
    print(manager.notify("get_all"))

    print("\n===== NEO4J RELATIONSHIPS =====")
    rels = manager.notify("get_all_relationships", {
        "relationship": "",
        "from_label": "",
        "to_label": ""
    })

    if rels:
        for r in rels:
            print(r)
    else:
        print("❌ No relationships found")


if __name__ == "__main__":
    main()

