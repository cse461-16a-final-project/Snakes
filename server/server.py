import socketio, eventlet, thread, threading, time
from flask import Flask, render_template
from json import JSONEncoder
from collections import deque
from game import Board, Snake

class Server:
	def __init__(self):
		self.encoder = JSONEncoder()
		self.sio = socketio.Server(async_mode='eventlet')
		self.app = Flask(__name__)

		self.board = Board()
		self.thread = None

		@self.app.route('/')
		def index():
			"""Serve the client-side application."""
			if not self.thread:
				self.thread = self.sio.start_background_task(self.runGame)
				self.thread = self.sio.start_background_task(self.tick)
			with open('../client/index.html', 'r') as f:
				read_data = f.read()
			return read_data

		@self.app.route('/<path>/<filename>')
		def serveFile(path, filename):
			with open('../client/' + path + '/' + filename, 'r') as f:
				read_data = f.read()
			return read_data

		@self.sio.on('connect')
		def connect(sid, environ):
			print 'connect ', sid

		@self.sio.on('new_user')
		def new_user(sid, data):
			# user = User()
			snake = Snake(self.board, sid, data)
			# user.snake = snake
			# self.users[sid] = user
			self.board.addSnake(snake)
			self.sio.emit('accept', str(sid))

		@self.sio.on('key')
		def key(sid, data):
			keyCode = int(data)
			if keyCode >= 37 and keyCode <= 40 and sid in self.board.snakes:
				self.board.snakes[sid].controlBuffer.append(keyCode - 37)

		@self.sio.on('disconnect')
		def disconnect(sid):
			print 'disconnect ', sid

	def update(self):
		self.sio.emit('game_state', self.encoder.encode(self.board.toState()))
		# print self.encoder.encode(self.board.toState())

	def tick(self):
		# pass
		self.update()
		self.sio.sleep(0.02)
		self.sio.start_background_task(self.tick)

	def runGame(self):
		for snake in self.board.snakes.values():
			# if snake.controlBuffer:
				# user.lastDirection = user.controlBuffer.popleft()
			# direction = user.lastDirection
			snake.move()
				# die
		self.sio.sleep(0.2)
		self.sio.start_background_task(self.runGame)

	def start(self):
		# wrap Flask application with socketio's middleware
		self.app = socketio.Middleware(self.sio, self.app)

		# deploy as an eventlet WSGI server
		eventlet.wsgi.server(eventlet.listen(('0.0.0.0', 8000)), self.app, log_output=False)
# class User:
# 	def __init__(self):
# 		self.controlBuffer = deque()
# 		self.lastDirection = 0
# 		self.snake = None

if __name__ == '__main__':
	server = Server()
	server.start()