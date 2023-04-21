const Kanban = require("../models/kanbanModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../middlewares/errors/apiError");
const ApiFeatures = require("../middlewares/ApiFeatures");

/*
  @ POST
  @ http://localhost:5000/api/kanbans/
  @ PRIVATE
*/
exports.createKanban = asyncHandler(async (req, res) => {
  const newKanban = await Kanban.create(req.body);
  res.status(200).json({ data: newKanban });
});

/*
  @ GET
  @ http://localhost:5000/api/kanbans/
  @ http://localhost:5000/api/kanbans/?rating[gte]=5&name=wael
  @ http://localhost:5000/api/kanbans/?sort=-rating
  @ http://localhost:5000/api/kanbans/?limit=5
  @ http://localhost:5000/api/kanbans/?keyword=elect
  @ http://localhost:5000/api/kanbans/?fields=name,rating
  @ PUBLIC
*/
exports.getKanban = asyncHandler(async (req, res, next) => {
  const documentCounts = await Kanban.countDocuments();
  const apiFeatures = new ApiFeatures(Kanban.find(), req.query)
    .paginate(documentCounts)
    .filter()
    .search()
    .limitFields()
    .sort();
  //excute
  const { mongooseQuery, paginationResult } = apiFeatures;
  const kanbans = await mongooseQuery;
  res
    .status(200)
    .json({ results: kanbans.length, paginationResult, data: kanbans });
});

/*
  @ GET
  @ http://localhost:5000/api/Kanbans/:id
  @ PUBLIC
*/
exports.getKanbanById = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const Kanban = await Kanban.findById(id);
  if (!Kanban) {
    return next(ApiError(`No Kanban for this id ${id}`, 404));
  } else {
    res.status(200).json({ data: Kanban });
  }
});

/*
  @ PUT
  @ http://localhost:5000/api/kanbans/:id
  @ PRIVATE
*/
exports.updateKanban = asyncHandler(async (req, res, next) => {
  const name = req.body.name;
  const KanbanNm = await Kanban.findOneAndUpdate(
    { name: name },
    {
      $set: req.body,
    },
    { new: true }
  );
  if (!KanbanNm) {
    return next(ApiError(`No Kanban for this id ${id}`, 404));
  } else {
    res.status(200).json({ data: KanbanNm });
  }
});

/*
  @ DELETE
  @ http://localhost:5000/api/kanbans/:id
  @ PRIVATE
*/
exports.deleteKanban = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const Kanban = await Kanban.findByIdAndDelete(id);
  if (!Kanban) {
    return next(ApiError(`No Kanban for this id ${id}`, 404));
  } else {
    res.status(200).json({ msg: "Kanban has been deleted.." });
  }
});
