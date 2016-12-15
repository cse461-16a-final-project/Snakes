from collections import deque
import random
class Board:
	def __init__(self):
		self.snakes = {}
		self.foods = set()

	def addSnake(self, sid, name):
		snake = Snake(self, sid, name)
		self.snakes[snake.sid] = snake
		self.addFood()
	
	def addFood(self):
		self.foods.add(self.getRandomLocation())

	def removeFood(self, location):
		self.foods.remove(location)
		self.addFood()

	def removeSnake(self, sid):
		self.foods.update(set(self.snakes[sid].body))
		del self.snakes[sid]
		print sid, "dead"
	
	def registerControl(self, sid, direction):
		self.snakes[sid].controlBuffer.append(direction)

	def isFood(self, location):
		return location in self.foods

	def isSnake(self, location):
		for s in self.snakes.values():
			if location in s.body:
				return True
		return False

	def outOfBoard(self, location):
		return not (0 <= location[0] < 80 and 0 <= location[1] < 80)

	def getRandomLocation(self):
		x = None
		y = None
		while x is None or y is None or self.isFood((x, y)) or self.isSnake((x, y)):
			x = int(random.uniform(0, 79))
			y = int(random.uniform(0, 79))
		return (x, y)

	def toState(self):
		state = {}
		state["snakes"] = [s.toState() for s in self.snakes.values()]
		state["foods"] = list(self.foods)
		return state

class Snake:
	def __init__(self, board, sid, name):
		self.controlBuffer = deque()
		self.body = deque()
		self.sid = sid
		self.board = board
		self.direction = int(random.uniform(0, 3))
		self.name = name
		self.body.append(self.board.getRandomLocation())

	# direction 0: left 1: up 2: right 3: down
	def move(self):
		if self.controlBuffer:
			direction = self.controlBuffer.popleft()
			if abs(direction - self.direction) != 2:
				self.direction = direction
		head = self.body[-1]
		nextHead = None
		if self.direction == 0:
			nextHead = (head[0] - 1, head[1])
		elif self.direction == 1:
			nextHead = (head[0], head[1] - 1)
		elif self.direction == 2:
			nextHead = (head[0] + 1, head[1])
		elif self.direction == 3:
			nextHead = (head[0], head[1] + 1)
		else:
			assert(False)
		if self.board.outOfBoard(nextHead) or self.board.isSnake(nextHead):
			self.board.removeSnake(self.sid)
		elif self.board.isFood(nextHead):
			self.board.removeFood(nextHead)
			self.body.append(nextHead)
		else:
			self.body.append(nextHead)
			self.body.popleft()

	def toState(self):
		state = {}
		state["body"] = list(self.body)
		state["sid"] = self.sid
		state["name"] = self.name
		return state