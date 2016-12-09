import socketio, eventlet, thread, threading, time
from flask import Flask, render_template
from json import JSONEncoder
from collections import deque

class Server:
	def __init__(self):
		self.encoder = JSONEncoder()
		self.sio = socketio.Server(async_mode='eventlet')
		self.app = Flask(__name__)
		self.x = 200
		self.y = 200
		self.dir = 37
		self.controlBuffer = deque([])
		self.thread = None

		@self.app.route('/')
		def index():
			"""Serve the client-side application."""
			if not self.thread:
				self.thread = self.sio.start_background_task(self.runGame)
				self.thread = self.sio.start_background_task(self.tick)
			return render_template('index.html')

		@self.sio.on('connect')
		def connect(sid, environ):
			print 'connect ', sid

		@self.sio.on('start')
		def start(sid, data):
			pass

		@self.sio.on('key')
		def key(sid, data):
			keyCode = int(data)
			if keyCode >= 37 and keyCode <= 40:
				self.controlBuffer.append(keyCode)

		@self.sio.on('disconnect')
		def disconnect(sid):
			print 'disconnect ', sid

	def update(self):
		self.sio.emit('game state', self.encoder.encode((self.x, self.y)))

	def tick(self):
		# pass
		self.update()
		self.sio.sleep(0.02)
		self.sio.start_background_task(self.tick)

	def runGame(self):
		if self.controlBuffer:
			self.dir = self.controlBuffer.popleft()
		direction = self.dir
		if direction == 37:
			self.x -= 20
		elif direction == 38:
			self.y -= 20
		elif direction == 39:
			self.x += 20
		elif direction == 40:
			self.y += 20
		# self.update()
		self.sio.sleep(0.5)
		self.sio.start_background_task(self.runGame)

	def start(self):
		# wrap Flask application with socketio's middleware
		self.app = socketio.Middleware(self.sio, self.app)

		# deploy as an eventlet WSGI server
		eventlet.wsgi.server(eventlet.listen(('0.0.0.0', 8000)), self.app, log_output=False)

if __name__ == '__main__':
	server = Server()
	server.start()