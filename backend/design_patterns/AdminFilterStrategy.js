// Strategy Interface
//class FilterStrategy {
  //async applyFilter(req, ComplaintModel) {
    //throw new Error("applyFilter must be implemented");
  //}
//}

// Concrete Strategy
// Sorting by date 
//class AdminSortByDateStrategy extends FilterStrategy {
  //async applyFilter(req, ComplaintModel, order) {
    //return await ComplaintModel.find({}).sort({ date: order });
  //}
//}

// Status filter is planned for Staff/Admin use, but not implemented yet
// Sorting by status

//class AdminSortByStatusStrategy extends FilterStrategy {
  //async applyFilter(req, ComplaintModel, order) {
    //return await ComplaintModel.find({}).sort({ status: order });
  //}
//}

// Sorting by category
//class AdminSortByCategoryStrategy extends FilterStrategy {
  //async applyFilter(req, ComplaintModel, order) {
    //return await ComplaintModel.find({}).sort({ category: order });
  //}
//}

//module.exports = {
  //FilterStrategy,
  //AdminSortByDateStrategy,
  //AdminSortByStatusStrategy,
  //AdminSortByCategoryStrategy,
//};