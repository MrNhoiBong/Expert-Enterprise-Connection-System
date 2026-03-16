from pymongo import MongoClient

from databases.manageDatabase.manageDb import ManageDb
from databases.implement.dataDaoImp import DataDAOImp
from databases.manageDatabase.worker.mongoWorker import MongoWorker


def main():

    # kết nối MongoDB
    client = MongoClient("mongodb://admin:admin123@localhost:27017/")

    db = client["mydb"]

    collection = db["database"]

    print("MongoDB connected")
    print("Total docs:", collection.count_documents({}))

    # tạo DAO
    dao = DataDAOImp(collection)

    # tạo worker
    mongo_worker = MongoWorker(dao)

    # tạo manager
    manager = ManageDb()

    manager.addworker(mongo_worker)

    # gọi database thông qua manager
    manager.notify("show_info")
    manager.notify("get_all")


if __name__ == "__main__":
    main()

