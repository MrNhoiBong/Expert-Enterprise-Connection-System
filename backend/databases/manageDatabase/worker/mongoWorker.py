from ..interface.daoWorker import DAOWorker


class MongoWorker(DAOWorker):

    def __init__(self, dao):
        self.dao = dao

    def handle(self, event: str):

        if event == "show_info":
            print(self.dao.showinfo())

        elif event == "get_all":
            results = self.dao.search({})
            print("Found:", len(results), "documents")

            for r in results:
                print(r.data)