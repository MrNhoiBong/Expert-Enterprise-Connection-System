from pymongo import MongoClient

from databases.manageDatabase.manageDb import ManageDb
from databases.implement.dataDaoImp import DataDAOImp
from databases.implement.relationshipDaoIml import RelationshipDAOImp
from databases.implement.imageDocDaoImp import ImageDocDAOImp
from databases.manageDatabase.worker.mongoWorker import MongoWorker
from databases.manageDatabase.worker.neo4jWorker import Neo4jWorker
from databases.manageDatabase.worker.minioWorker import MinioWorker
from databases.connectMongoNeo import MongoToNeo4jSync


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
    neo4jDao    = RelationshipDAOImp(
        uri="bolt://localhost:7687",
        user="neo4j",
        password="password"
    )
    neo4jWorker = Neo4jWorker(neo4jDao)

    # MongoDB
    client      = MongoClient("mongodb://admin:admin123@localhost:27017/")
    db          = client["mydb"]
    print("📦 Collections:", db.list_collection_names())
    mongoDao    = DataDAOImp(db)
    mongoWorker = MongoWorker(mongoDao)

    # MinIO
    minioDao    = ImageDocDAOImp(
        endpoint="localhost:9000",
        access_key="minioadmin",
        secret_key="minioadmin123",
        secure=False
    )
    minioWorker = MinioWorker(minioDao)

    # =========================
    # 3. MANAGER
    # =========================
    manager = ManageDb()
    manager.addworker(mongoWorker)
    manager.addworker(neo4jWorker)
    manager.addworker(minioWorker)

    # =========================
    # 4. DATABASE INFO
    # =========================
    print("\n===== DATABASE INFO =====")
    manager.notify("show_info")

    # =========================
    # 5. MONGO DATA
    # =========================
    print("\n===== MONGO DATA =====")
    manager.notify("get_all")

    # =========================
    # 6. NEO4J RELATIONSHIPS
    # =========================
    print("\n===== NEO4J RELATIONSHIPS =====")
    rels = manager.notify("get_all_relationships", {
        "relationship": "",
        "from_label":   "",
        "to_label":     ""
    })
    if rels:
        for r in rels:
            print(f"  {r}")
    else:
        print("❌ No relationships found")

    # =========================
    # 7. MINIO - ĐỌC FILE CÓ SẴN
    # =========================
    print("\n===== MINIO FILES =====")

    print("\n--- Tất cả files ---")
    manager.notify("minio_search", {})                                    # ✅

    print("\n--- Files của PRJ001 ---")
    manager.notify("minio_search", {"project_id": "PRJ001"})             # ✅

    print("\n--- Files upload bởi EXP001 ---")
    manager.notify("minio_search", {"uploaded_by": "EXP001"})            # ✅

    print("\n--- Images ---")
    manager.notify("minio_search", {"content_type": "image/"})           # ✅

    print("\n--- Documents ---")
    manager.notify("minio_search", {"content_type": "application/"})     # ✅

    print("\n--- Presigned URL ---")
    manager.notify("get_all_urls", {"expires_hours": 24})


if __name__ == "__main__":
    main()