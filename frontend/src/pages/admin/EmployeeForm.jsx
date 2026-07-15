import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import {
  Save, Upload, X, Loader2, Image as ImageIcon, ArrowLeft,
  User, Briefcase, MapPin, Shield, Camera, Info, RefreshCw, CheckCircle2
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const EmployeeForm = ({ mode = 'create' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(mode === 'edit');
  const [dragOver, setDragOver] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saved, setSaved] = useState(false);

  const initialFormState = {
    firstName: '', lastName: '', fatherName: '',
    gender: 'Male', dob: '', mobile: '', email: '',
    address: '', city: '', state: '', pincode: '',
    branch: 'HEADOFFICE', department: 'SALES',
    designation: '', role: 'Employee',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'Active', username: '', password: '', confirmPassword: '',
    photo: '', employeeId: '',
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (mode === 'edit' && id) fetchEmployee();
    else if (mode === 'create') fetchNextId();
  }, [id, mode]);

  const fetchNextId = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/employees/next-id', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData((p) => ({ ...p, employeeId: res.data.employeeId }));
    } catch (err) {
      console.error('Error fetching next ID:', err);
    }
  };

  const fetchEmployee = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/employees/${id}', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.employee || res.data;
      setFormData({
        ...data,
        branch: data.branchId || data.branch,
        department: data.departmentId || data.department,
        joiningDate: data.joiningDate ? data.joiningDate.split('T')[0] : '',
        dob: data.dob ? data.dob.split('T')[0] : '',
        password: '', confirmPassword: '',
      });
      if (data.photo) setPhotoPreview(data.photo);
    } catch {
      alert('Error fetching employee');
      navigate('/admin/employees');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobile' && value !== '' && !/^[0-9]+$/.test(value)) return;
    const upper = ['firstName', 'lastName', 'fatherName', 'address', 'city', 'state', 'designation'];
    setFormData((p) => ({ ...p, [name]: upper.includes(name) ? value.toUpperCase() : value }));
  };

  const processFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
      setFormData((p) => ({ ...p, photo: reader.result }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handlePhotoChange = (e) => processFile(e.target.files[0]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the form?')) {
      setFormData(p => ({ ...initialFormState, employeeId: p.employeeId }));
      setPhotoPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const password = formData.password?.trim();
    const confirmPassword = formData.confirmPassword?.trim();

    if (mode === 'create') {
      if (!formData.username) return alert('Username is required');
      if (password !== confirmPassword) return alert('Passwords do not match');
      if (password.length < 8) return alert('Password must be at least 8 characters');
    }
    if (formData.mobile.length !== 10) return alert('Mobile must be 10 digits');

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (mode === 'create') {
        const res = await api.post('/employees', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const createdEmployeeId = res.data.employeeId;
        setFormData(p => ({ ...p, employeeId: createdEmployeeId }));
        
        setSaved(true);
        alert(`Employee created successfully.\nEmployee ID: ${createdEmployeeId}`);
        setTimeout(() => navigate('/admin/employees'), 1200);
      } else {
        await api.put('/employees/${id}', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSaved(true);
        setTimeout(() => navigate('/admin/employees'), 1200);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving employee');
    } finally {
      setLoading(false);
    }
  };

  const progress = useMemo(() => {
    const requiredFields = [
      'firstName', 'lastName', 'fatherName', 'mobile',
      'branch', 'department', 'designation', 'role',
      'username'
    ];
    if (mode === 'create') requiredFields.push('password', 'confirmPassword');
    
    let filled = 0;
    requiredFields.forEach(f => {
      if (formData[f] && formData[f].trim() !== '') filled++;
    });
    return Math.round((filled / requiredFields.length) * 100);
  }, [formData, mode]);

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 gap-2">
        <Loader2 className="animate-spin" size={24} /> Loading record...
      </div>
    );
  }

  const SectionHeader = ({ icon: Icon, title, description }) => (
    <div className="flex items-start gap-4 mb-8 pb-4 border-b border-gray-100">
      <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
        <Icon className="text-green-600" size={20} />
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-28">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <Button 
            variant="outline" 
            size="sm" 
            icon={ArrowLeft} 
            onClick={() => navigate('/admin/employees')}
            className="border-none bg-transparent hover:bg-gray-100 text-gray-600 px-0 shadow-none mb-4 -ml-2"
          >
            Back to Directory
          </Button>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                {mode === 'create' ? 'Add New Employee' : 'Edit Employee Profile'}
              </h1>
              <p className="text-sm text-gray-500">
                {mode === 'create' ? 'Create a new employee profile for Belwin ERP.' : 'Update existing employee information and preferences.'}
              </p>
            </div>
            
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Employee ID</span>
              <Badge variant="success" className="font-mono text-sm px-3 py-1 shadow-sm">
                {formData.employeeId || 'AUTO GENERATED'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column - Main Form (70%) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Personal Info */}
              <Card className="p-8 hover:shadow-md transition-shadow duration-300">
                <SectionHeader 
                  icon={User} 
                  title="Personal Information" 
                  description="Basic identity and contact details."
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="e.g. RAJESH" />
                  <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="e.g. KUMAR" />
                  <Input label="Father Name" name="fatherName" value={formData.fatherName} onChange={handleChange} required />
                  <Select label="Gender" name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Select>
                  <Input label="Date of Birth" type="date" name="dob" value={formData.dob} onChange={handleChange} />
                  <Input label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} required maxLength={10} />
                  <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required containerClassName="md:col-span-2" />
                </div>
              </Card>

              {/* Employment Info */}
              <Card className="p-8 hover:shadow-md transition-shadow duration-300">
                <SectionHeader 
                  icon={Briefcase} 
                  title="Employment Information" 
                  description="Role, department, and branch assignments."
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select label="Branch Name" name="branch" value={formData.branch} onChange={handleChange}>
                    <option value="HEADOFFICE">Head Office</option>
                    <option value="BRANCH01">Branch 01</option>
                    <option value="BRANCH02">Branch 02</option>
                  </Select>
                  <Select label="Department" name="department" value={formData.department} onChange={handleChange}>
                    <option value="SALES">Sales</option>
                    <option value="COLLECTION">Collection</option>
                    <option value="ADMIN">Administration</option>
                    <option value="IT">IT Support</option>
                  </Select>
                  <Input label="Designation" name="designation" value={formData.designation} onChange={handleChange} required placeholder="e.g. MANAGER" />
                  <Input label="Joining Date" type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} />
                  <Select label="Role" name="role" value={formData.role} onChange={handleChange}>
                    <option value="Employee">Employee</option>
                    <option value="Admin">Admin</option>
                  </Select>
                  <Select label="Status" name="status" value={formData.status} onChange={handleChange}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Terminated">Terminated</option>
                  </Select>
                </div>
              </Card>

              {/* Address Info */}
              <Card className="p-8 hover:shadow-md transition-shadow duration-300">
                <SectionHeader 
                  icon={MapPin} 
                  title="Address Information" 
                  description="Residential address and location."
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Full Address" name="address" value={formData.address} onChange={handleChange} containerClassName="md:col-span-2" />
                  <Input label="City" name="city" value={formData.city} onChange={handleChange} />
                  <Input label="State" name="state" value={formData.state} onChange={handleChange} />
                  <Input label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} />
                </div>
              </Card>

              {/* Account Info */}
              <Card className="p-8 hover:shadow-md transition-shadow duration-300">
                <SectionHeader 
                  icon={Shield} 
                  title="Account Information" 
                  description="System access and security credentials."
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="System Username" name="username" value={formData.username} onChange={handleChange} required containerClassName={mode === 'edit' ? 'md:col-span-2 md:max-w-md' : ''} />
                  
                  {mode === 'create' && (
                    <>
                      <div className="hidden md:block"></div>
                      <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} required />
                      <Input label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
                    </>
                  )}
                </div>
              </Card>

            </div>

            {/* Right Column - Sticky Sidebar (30%) */}
            <div className="lg:col-span-4 relative">
              <div className="sticky top-6 space-y-6">
                
                {/* Photo Upload */}
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Camera className="text-gray-400" size={18} />
                    <h3 className="font-bold text-gray-900">Profile Photo</h3>
                  </div>
                  
                  <div
                    ref={dropRef}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => !photoPreview && fileInputRef.current.click()}
                    className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center relative overflow-hidden transition-all ${
                      photoPreview ? 'cursor-default border-none shadow-inner' : 'cursor-pointer border-2 border-dashed'
                    } ${dragOver ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'}`}
                  >
                    {photoPreview ? (
                      <>
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
                            className="bg-white text-gray-900 rounded-full px-4 py-2 text-xs font-bold shadow-sm"
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setPhotoPreview(null); setFormData((p) => ({ ...p, photo: '' })); }}
                            className="bg-red-500 text-white rounded-full p-2 shadow-sm"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-6">
                        <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-4">
                          <ImageIcon className="text-gray-400" size={26} />
                        </div>
                        <p className="text-sm font-bold text-gray-900 mb-1">Upload Photo</p>
                        <p className="text-xs text-gray-500">Drag & Drop or Click</p>
                      </div>
                    )}
                  </div>
                  
                  <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" accept="image/png, image/jpeg, image/jpg" />
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-[11px] text-gray-500 text-center font-medium">
                      Supported formats: PNG, JPG, JPEG.<br/>Maximum size: 2MB.
                    </p>
                  </div>
                </Card>

                {/* Status Summary */}
                <Card className="p-6">
                  <h3 className="font-bold text-gray-900 mb-5">Profile Summary</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="font-bold text-gray-500 uppercase tracking-wider">Completion</span>
                        <span className="font-bold text-green-600">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Account Status</span>
                        <Badge variant={formData.status === 'Active' ? 'success' : 'inactive'}>{formData.status}</Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Assigned Branch</span>
                        <span className="font-semibold text-gray-900">{formData.branch}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">System Role</span>
                        <span className="font-semibold text-gray-900">{formData.role}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Joining Date</span>
                        <span className="font-semibold text-gray-900">{formData.joiningDate || '-'}</span>
                      </div>
                    </div>
                  </div>
                </Card>
                
                {mode === 'create' && (
                  <Card className="p-5 bg-gray-900 text-white border-gray-800">
                    <div className="flex items-center gap-2 mb-3">
                      <Info className="text-blue-400" size={16} />
                      <h3 className="font-bold text-sm">Password Security</h3>
                    </div>
                    <ul className="text-xs text-gray-400 space-y-2 pl-6 list-disc">
                      <li className={formData.password?.length >= 8 ? "text-green-400 transition-colors" : ""}>Minimum 8 characters length</li>
                      <li className={formData.password && formData.password === formData.confirmPassword ? "text-green-400 transition-colors" : ""}>Passwords must match exactly</li>
                    </ul>
                  </Card>
                )}

              </div>
            </div>

          </div>

          {/* Sticky Bottom Action Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
            <div className="max-w-7xl mx-auto px-2 flex items-center justify-between">
              <Button type="button" variant="outline" onClick={() => navigate('/admin/employees')} className="bg-white">
                Cancel
              </Button>
              
              <div className="flex gap-3">
                <Button type="button" variant="secondary" icon={RefreshCw} onClick={handleReset} disabled={loading || saved}>
                  Reset
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  loading={loading} 
                  disabled={saved}
                  icon={saved ? CheckCircle2 : Save}
                  className="px-8 shadow-green-500/20 shadow-lg"
                >
                  {saved ? 'Saved Successfully' : (mode === 'create' ? 'Save Employee' : 'Update Record')}
                </Button>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
