const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');

const Task = require('../models/Task');
const { addTask, getTasks, updateTask, deleteTask } = require('../controllers/taskController');

afterEach(() => sinon.restore());

describe('AddTask Function Test', () => {
  it('should create a new task successfully', async () => {
    const userId = new mongoose.Types.ObjectId();
    const req = {
      user: { _id: userId },
      body: { title: 'New Task', description: 'Task description', deadline: '2025-12-31' },
    };

    const createdTask = { _id: new mongoose.Types.ObjectId(), ...req.body, userId };
    createdTask.populate = sinon.stub().resolves(createdTask);

    const createStub = sinon.stub(Task, 'create').resolves(createdTask);

    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await addTask(req, res);

    expect(createStub.calledOnce).to.be.true;
    expect(createStub.calledOnceWithMatch(sinon.match({ userId }))).to.be.true;
    expect(createdTask.populate.calledOnce).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(createdTask)).to.be.true;
  });

  it('should return 500 if an error occurs', async () => {
    const userId = new mongoose.Types.ObjectId();
    const req = {
      user: { _id: userId },
      body: { title: 'New Task', description: 'Task description', deadline: '2025-12-31' },
    };

    sinon.stub(Task, 'create').rejects(new Error('DB Error'));

    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await addTask(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });
});

describe('Update Function Test', () => {
  it('should update task successfully', async () => {
    const taskId = new mongoose.Types.ObjectId();
    const existingTask = {
      _id: taskId,
      title: 'Old Task',
      description: 'Old Description',
      completed: false,
      deadline: new Date(),
      save: sinon.stub().resolvesThis(),
      populate: sinon.stub().resolvesThis(),
      userId: new mongoose.Types.ObjectId(),
    };

    sinon.stub(Task, 'findById').resolves(existingTask);

    const req = {
      params: { id: taskId },
      user: { _id: existingTask.userId },
      body: { title: 'New Task', completed: true },
    };
    const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

    await updateTask(req, res);

    expect(existingTask.title).to.equal('New Task');
    expect(existingTask.completed).to.equal(true);
    expect(res.status.called).to.be.false;
    expect(res.json.calledOnce).to.be.true;
  });

  it('should return 404 if task is not found', async () => {
    sinon.stub(Task, 'findById').resolves(null);

    const req = { params: { id: new mongoose.Types.ObjectId() }, user: { _id: new mongoose.Types.ObjectId() }, body: {} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await updateTask(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Task not found' })).to.be.true;
  });

  it('should return 500 on error', async () => {
    sinon.stub(Task, 'findById').rejects(new Error('DB Error'));

    const req = { params: { id: new mongoose.Types.ObjectId() }, user: { _id: new mongoose.Types.ObjectId() }, body: {} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await updateTask(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.called).to.be.true;
  });
});

describe('GetTask Function Test', () => {
  it('should return tasks for the given user', async () => {
    const userId = new mongoose.Types.ObjectId();
    const tasks = [
      { _id: new mongoose.Types.ObjectId(), title: 'Task 1', userId },
      { _id: new mongoose.Types.ObjectId(), title: 'Task 2', userId },
    ];

    const execStub = sinon.stub().resolves(tasks);
    const populateStub = sinon.stub().returns({ exec: execStub });
    sinon.stub(Task, 'find').returns({ populate: populateStub, exec: execStub });

    const req = { user: { role: 'mentor', _id: userId } };
    const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

    await getTasks(req, res);

    expect(Task.find.calledOnceWith({ userId })).to.be.true;
    expect(res.json.calledWith(tasks)).to.be.true;
    expect(res.status.called).to.be.false;
  });

  it('should return 500 on error', async () => {
    const execStub = sinon.stub().rejects(new Error('DB Error'));
    const populateStub = sinon.stub().returns({ exec: execStub });
    sinon.stub(Task, 'find').returns({ populate: populateStub, exec: execStub });

    const req = { user: { role: 'mentor', _id: new mongoose.Types.ObjectId() } };
    const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

    await getTasks(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });
});

describe('DeleteTask Function Test', () => {
  it('should delete a task successfully', async () => {
    const req = { params: { id: new mongoose.Types.ObjectId().toString() }, user: { _id: new mongoose.Types.ObjectId() } };

    const task = {
      userId: req.user._id,
      deleteOne: sinon.stub().resolves(),
    };
    sinon.stub(Task, 'findById').resolves(task);

    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await deleteTask(req, res);

    expect(Task.findById.calledOnceWith(req.params.id)).to.be.true;
    expect(task.deleteOne.calledOnce).to.be.true;
    expect(res.json.calledWith({ message: 'Task deleted' })).to.be.true;
  });

  it('should return 404 if task is not found', async () => {
    sinon.stub(Task, 'findById').resolves(null);

    const req = { params: { id: new mongoose.Types.ObjectId().toString() }, user: { _id: new mongoose.Types.ObjectId() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await deleteTask(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Task not found' })).to.be.true;
  });

  it('should return 500 if an error occurs', async () => {
    sinon.stub(Task, 'findById').rejects(new Error('DB Error'));

    const req = { params: { id: new mongoose.Types.ObjectId().toString() }, user: { _id: new mongoose.Types.ObjectId() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await deleteTask(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });
});
