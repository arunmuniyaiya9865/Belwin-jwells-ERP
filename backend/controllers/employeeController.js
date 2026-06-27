const ApiError = require('../utils/ApiError');
const Employee = require('../models/Employee');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
const getEmployees = async (req, res, next) => {
    try {
        const employees = await Employee.find({}).populate('department', 'name');
        res.json(employees);
    } catch (error) {
        next(new ApiError(500, 'Server error' ));
    }
};

// @desc    Get employee by ID
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res, next) => {
    try {
        const employee = await Employee.findById(req.params.id).populate('department', 'name');
        if (employee) {
            res.json(employee);
        } else {
            next(new ApiError(404, 'Employee not found' ));
        }
    } catch (error) {
        next(new ApiError(500, 'Server error' ));
    }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private/Admin
const createEmployee = async (req, res, next) => {
    try {
        const employee = new Employee({
            ...req.body,
            documentUrl: req.file ? `/uploads/${req.file.filename}` : ''
        });
        const createdEmployee = await employee.save();
        res.status(201).json(createdEmployee);
    } catch (error) {
        next(new ApiError(400, 'Invalid employee data' ));
    }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private/Admin
const updateEmployee = async (req, res, next) => {
    try {
        const employee = await Employee.findById(req.params.id);

        if (employee) {
            Object.assign(employee, req.body);
            if (req.file) {
                employee.documentUrl = `/uploads/${req.file.filename}`;
            }
            const updatedEmployee = await employee.save();
            res.json(updatedEmployee);
        } else {
            next(new ApiError(404, 'Employee not found' ));
        }
    } catch (error) {
        next(new ApiError(400, 'Invalid employee data' ));
    }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private/Admin
const deleteEmployee = async (req, res, next) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (employee) {
            await Employee.deleteOne({ _id: employee._id });
            res.json({ message: 'Employee removed' });
        } else {
            next(new ApiError(404, 'Employee not found' ));
        }
    } catch (error) {
        next(new ApiError(500, 'Server error' ));
    }
};

module.exports = {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee
};
