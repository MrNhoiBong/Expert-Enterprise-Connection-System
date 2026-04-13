from typing import List
from .interface.daoWorker import DAOWorker


class ManageDb:

    def __init__(self):
        self.workers: List[DAOWorker] = []

    def addworker(self, worker: DAOWorker):
        self.workers.append(worker)

    def rmworker(self, worker: DAOWorker):
        if worker in self.workers:
            self.workers.remove(worker)

    def notify(self, event, data=None):
        results = []

        for w in self.workers:
            if w.can_handle(event):
                res = w.handle(event, data)
                if res is not None:
                    results.append(res)

        return results if results else None