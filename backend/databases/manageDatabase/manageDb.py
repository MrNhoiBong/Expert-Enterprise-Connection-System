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

    def notify(self, event: str):
        for worker in self.workers:
            worker.handle(event)