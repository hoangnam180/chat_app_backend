const data = [
  {
    id: 1,
    username: 'test1',
    name: 'test1',
    age: 20,
  },
  {
    id: 2,
    username: 'test2',
    name: 'test2',
    age: 20,
  },
  {
    id: 3,
    username: 'test3',
    name: 'test3',
    age: 30,
  },
];
class siteControllers {
  // [GET] REGISTER
  index = (req, res) => {
    return res.status(200).json({
      users: req.data ? req.data : data,
    });
  };
}

module.exports = new siteControllers();
