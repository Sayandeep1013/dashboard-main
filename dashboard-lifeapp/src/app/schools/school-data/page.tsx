"use client";
import '@tabler/core/dist/css/tabler.min.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect, useRef, useMemo } from 'react';
import React from 'react';
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
import { Sidebar } from '@/components/ui/sidebar';
import { IconSearch, IconBell, IconSettings, IconEdit, IconTrash } from '@tabler/icons-react';
import { ChevronDown, Download, Plus, Search, XCircle } from "lucide-react";
import cluster from 'cluster';

// const poppins = Poppins({
//   subsets: ['latin'],
//   weight: ['400', '600', '700'],
//   variable: '--font-poppins',
// });

// ------------------- SEARCHABLE DROPDOWN COMPONENT -------------------
interface SearchableDropdownProps {
  options: string[];
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
  maxDisplayItems?: number;
}
function SearchableDropdown({
  options,
  placeholder,
  value,
  onChange,
  isLoading = false,
  maxDisplayItems = 100,
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [displayedItems, setDisplayedItems] = useState(maxDisplayItems);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setDisplayedItems(maxDisplayItems);
    }, 300);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchTerm, maxDisplayItems]);

  const filteredOptions = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return options;
    const searchLower = debouncedSearchTerm.toLowerCase();
    return options.filter(option => option.toLowerCase().includes(searchLower));
  }, [options, debouncedSearchTerm]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 50 && displayedItems < filteredOptions.length) {
      setDisplayedItems(prev => Math.min(prev + maxDisplayItems, filteredOptions.length));
    }
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (scrollContainer) scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [displayedItems, filteredOptions.length, maxDisplayItems]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setDisplayedItems(maxDisplayItems);
  };

  const visibleOptions = useMemo(() => filteredOptions.slice(0, displayedItems), [filteredOptions, displayedItems]);
  const hasMoreItems = filteredOptions.length > displayedItems;

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
        onClick={() => setIsOpen(!isOpen)}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={value ? "text-gray-900" : "text-gray-500"}>
          {isLoading ? "Loading..." : (value || placeholder)}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </div>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg">
          <div className="p-2">
            <input
              type="text"
              className="w-full rounded-md border px-3 py-1 text-sm"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-auto" ref={scrollContainerRef}>
            {isLoading ? (
              <div className="px-3 py-2 text-gray-500">Loading options...</div>
            ) : (
              <>
                {visibleOptions.length > 0 ? (
                  visibleOptions.map((option, index) => (
                    <div
                      key={index}
                      className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                      onClick={() => handleSelect(option)}
                    >
                      {option}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-gray-500">No results found</div>
                )}
                {hasMoreItems && (
                  <div className="flex items-center justify-center px-3 py-2 text-gray-500 border-t bg-gray-50">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                    <span>Loading more... ({visibleOptions.length} of {filteredOptions.length})</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

//const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
const api_startpoint = 'http://152.42.239.141:5000'
// const api_startpoint = 'http://152.42.239.141:5000'
// ------------------- MAIN COMPONENT -------------------
export default function SchoolData() {
  // ---------- State Variables ----------
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [filterName, setFilterName] = useState("");
  const [inputCode, setInputCode] = useState("");
  // Update existing state declaration
  const [selectedSchoolCode, setSelectedSchoolCode] = useState<string[]>([]);
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterCluster, setFilterCluster] = useState("");
  const [filterBlock, setFilterBlock] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editSchoolData, setEditSchoolData] = useState<any>({});
  const [deleteSchoolId, setDeleteSchoolId] = useState<number | null>(null);
  const [addSchoolData, setAddSchoolData] = useState<any>({
    name: "",
    state: "",
    city: "",
    district: "",
    block: "",
    cluster: "",
    pin_code: "",
    code: "",
    app_visible: "No",
    is_life_lab: "No",
    status: "Inactive",
    donor_name: "",   // ← new field
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage]       = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows]   = useState(0);
  const rowsPerPage = 50;
  // const paginatedData = tableData.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  // ---------- Fetching Functions ----------
  const fetchSchools = async () => {
    const filters = {
      name: filterName,
      state: selectedState,
      city: selectedCity,
      district: filterDistrict,
      block: filterBlock,
      cluster: filterCluster,
      code: selectedSchoolCode.length > 0 ? selectedSchoolCode : undefined,
      status: filterStatus,
      page: currentPage,
      per_page: rowsPerPage,
    }
    setLoading(true);
    try {
      // For this example, we simply fetch all schools. 
      // You can extend your API to accept query parameters for filtering.
      const res = await fetch(`${api_startpoint}/api/get_schools_data`,{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });
      if (!res.ok) {
        throw new Error(`API responded with status: ${res.status}`);
      }
      const { data, total, total_pages } = await res.json();
      setTableData(data);
      setTotalRows(total);
      setTotalPages(total_pages);
    } catch (error) {
      console.error("Error fetching schools:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async () => {
    try {
      const res = await fetch(`${api_startpoint}/api/state_list`);
      const data = await res.json();
      // Map the objects to their 'state' property if needed:
      const statesArray = data.map((item: any) => item.state || item);
      setStates(statesArray);
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };
  

  const fetchCitiesForState = async (st: string) => {
    if (!st) {
      setCities([]);
      return;
    }
    try {
      const res = await fetch(`${api_startpoint}/api/cities_for_state?state=${encodeURIComponent(st)}`);
      const data = await res.json();
      setCities(data);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  // ---------- Effects ----------
  useEffect(() => {
    fetchSchools();
    fetchStates();
  }, [currentPage, perPage]);

  useEffect(() => {
    if (selectedState) {
      fetchCitiesForState(selectedState);
    } else {
      setCities([]);
      setSelectedCity("");
    }
  }, [selectedState]);

  // ---------- Handlers ----------
  const handleEditClick = (school: any) => {
    setEditSchoolData({ ...school, donor_name: school.donor_name || ""  });
    setShowEditModal(true);
  };

  const handleEditModalSave = async () => {
    try {
      const res = await fetch(`${api_startpoint}/api/schools_data/${editSchoolData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editSchoolData),
      });
      if (!res.ok) {
        console.error("Failed to update school");
        return;
      }
      setShowEditModal(false);
      fetchSchools();
    } catch (error) {
      console.error("Error updating school:", error);
    }
  };

  const handleDeleteClick = (schoolId: number) => {
    setDeleteSchoolId(schoolId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteSchoolId) return;
    try {
      const res = await fetch(`${api_startpoint}/api/schools_data/${deleteSchoolId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        console.error("Failed to delete school");
        return;
      }
      setShowDeleteModal(false);
      fetchSchools();
    } catch (error) {
      console.error("Error deleting school:", error);
    }
  };

  const handleAddSchool = async () => {
    try {
      const res = await fetch(`${api_startpoint}/api/schools_data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addSchoolData),
      });
      if (!res.ok) {
        console.error("Failed to add school");
        return;
      }
      setShowAddModal(false);
      setAddSchoolData({
        name: "",
        state: "",
        city: "",
        district: "",
        pin_code: "",
        app_visible: "No",
        is_life_lab: "No",
        status: "Inactive",
        donor_name: "",   // ← reset it
      });
      fetchSchools();
    } catch (error) {
      console.error("Error adding school:", error);
    }
  };

  const handleClear = () => {
    setFilterName("");
    setSelectedSchoolCode([]);
    setFilterDistrict("");
    setFilterBlock("");
    setSelectedSchoolCode([]);
    setFilterStatus("");
    setSelectedState("");
    setSelectedCity("");
    setCurrentPage(0);
    fetchSchools();
  };

  // const handlePrevPage = () => {
  //   setCurrentPage(prev => Math.max(prev - 1, 0));
  // };

  // const handleNextPage = () => {
  //   setCurrentPage(prev => (prev + 1) * rowsPerPage < tableData.length ? prev + 1 : prev);
  // };
  // 3) Prev/Next handlers
  const goPrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const goNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  // 4) Rows-per-page change
  const onPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Add this state near other modal states
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Add this handler
  const handleCsvUpload = async () => {
    if (!csvFile) return;

    const formData = new FormData();
    formData.append('csv', csvFile);

    try {
      setUploadStatus('Uploading...');
      const res = await fetch(`${api_startpoint}/api/upload_schools_csv`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());
      
      setUploadStatus('Upload successful!');
      setTimeout(() => {
        setShowCsvModal(false);
        fetchSchools();
      }, 1500);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('Upload failed. Please check the file format.');
    }
  };

  // -------- CSV Template Download Setup --------
  const csvTemplate =
  "school_name,state_name,city_name,district_name,block_name,cluster_name,pin_code,school_code,donor_name,app_visible,is_life_lab,status\n";
  const downloadCsvTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'school_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  // ------------------- Render -------------------
  return (
    <div className={`page bg-light ${inter.className} font-sans`}>
      <Sidebar />
      <div className="page-wrapper" style={{ marginLeft: "250px" }}>
        {/* Top Navigation */}
        {/* <header className="navbar navbar-expand-md navbar-light bg-white shadow-sm border-bottom mb-3">
          <div className="container-fluid">
            <div className="d-flex align-items-center w-full">
              <span className="font-bold text-xl text-black">LifeAppDashBoard</span>
              <div className="w-5/6 h-10"></div>
              <div className="d-flex gap-3 align-items-center">
                <a href="#" className="btn btn-light btn-icon">
                  <IconSearch size={20} className="text-muted" />
                </a>
                <a href="#" className="btn btn-light btn-icon position-relative">
                  <IconBell size={20} className="text-muted" />
                  <span className="badge bg-danger position-absolute top-0 end-0">3</span>
                </a>
                <a href="#" className="btn btn-light btn-icon">
                  <IconSettings size={20} className="text-muted" />
                </a>
              </div>
            </div>
          </div>
        </header> */}
        <div className='page-body'>
          <div className="container-xl pt-0 pb-4">
            {/* Search & Filter Section */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body">
                <h5 className="card-title mb-4">School Data</h5>
                <div className="row g-3">
                  <div className="col-12 col-md-6 col-lg-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter School Name"
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-4">
                    <div className="border rounded p-2 bg-white">
                        
                        <input
                        type="text"
                        placeholder="Search With School code (comma separated)"
                        className="form-control border-0 p-0"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        onKeyDown={(e) => {
                            if (['Enter', ',', ' '].includes(e.key)) {
                            e.preventDefault();
                            const code = inputCode.trim();
                            if (code && !selectedSchoolCode.includes(code)) {
                                setSelectedSchoolCode(prev => [...prev, code]);
                            }
                            setInputCode('');
                            }
                        }}
                        />
                        <div className="d-flex flex-wrap gap-2 mt-2">
                        {selectedSchoolCode.map(code => (
                            <span key={code} className="badge bg-purple text-white d-flex align-items-center">
                            {code}
                            <button 
                                type="button" 
                                className="btn-close btn-close-white ms-2" 
                                onClick={() => setSelectedSchoolCode(prev => prev.filter(c => c !== code))}
                                aria-label="Remove"
                            ></button>
                            </span>
                        ))}
                        </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter District"
                      value={filterDistrict}
                      onChange={(e) => setFilterDistrict(e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Block"
                      value={filterBlock}
                      onChange={(e) => setFilterBlock(e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Cluster"
                      value={filterCluster}
                      onChange={(e) => setFilterCluster(e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <select
                      className="form-select"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="">Select Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <SearchableDropdown
                      options={states}
                      placeholder="Select State"
                      value={selectedState}
                      onChange={(val) => setSelectedState(val)}
                      isLoading={false}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <SearchableDropdown
                      options={cities}
                      placeholder="Select City"
                      value={selectedCity}
                      onChange={(val) => setSelectedCity(val)}
                      isLoading={false}
                    />
                  </div>
                </div>
                <div className="row g-3 mt-2">
                  
                </div>
                <div className="row g-3 mt-2">
                  <div className="col-12 d-flex gap-2">
                    <button className="btn btn-success d-inline-flex align-items-center" onClick={fetchSchools}>
                      <Search className="me-2" size={16} /> Search
                    </button>
                    <button className="btn btn-warning d-inline-flex align-items-center text-dark" onClick={handleClear}>
                      <XCircle className="me-2" size={16} /> Clear
                    </button>
                    <button className="btn btn-success d-inline-flex align-items-center" onClick={() => setShowAddModal(true)}>
                      <Plus className="me-2" size={16} /> Add School
                    </button>
                    <button className="btn btn-info d-inline-flex align-items-center text-white" onClick={() => setShowCsvModal(true)}>
                      <Plus className="me-2" size={16} /> Upload CSV
                    </button>
                    {/* Download Template Button */}
                    <button className="btn btn-secondary d-inline-flex align-items-center ms-2" onClick={downloadCsvTemplate}>
                      <Download className="me-2" size={16} /> Download CSV Template
                    </button>
                  </div>
                </div>
              </div>
            

            {/* TABLE OF SCHOOLS WITH PAGINATION */}
              <div className="card shadow-sm border-0 mt-2 mb-4">
                <div className="card-body overflow-x-scroll">
                  <h5 className="card-title">All Schools- {totalRows} Schools found</h5>
                  {loading ? (
                    <div className="text-center p-5">
                        <div className="spinner-border text-purple" role="status" style={{ width: "3rem", height: "3rem" }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted">Loading data, please wait...</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-bordered table-hover">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>State</th>
                            <th>City</th>
                            <th>District</th>
                            <th>Block</th>
                            <th>Cluster</th>
                            <th>Pin Code</th>
                            <th>Code</th>
                            <th>Donor Name</th>
                            <th>App Visible</th>
                            <th>Is Life Lab</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.map((school) => (
                            <tr key={school.id}>
                              <td>{school.id}</td>
                              <td>{school.name}</td>
                              <td>{school.state}</td>
                              <td>{school.city}</td>
                              <td>{school.district}</td>
                              <td>{school.block}</td>
                              <td>{school.cluster}</td>
                              <td>{school.pin_code}</td>
                              <td>{school.code}</td>
                              <td>{school.donor_name}</td>
                              <td>{school.app_visible}</td>
                              <td>{school.is_life_lab}</td>
                              <td>{school.status}</td>
                              <td>
                                <button className="btn btn-sm btn-primary me-2" onClick={() => handleEditClick(school)}>
                                  <IconEdit size={16} />
                                </button>
                                <button className="btn btn-sm btn-danger" onClick={() => handleDeleteClick(school.id)}>
                                  <IconTrash size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {/* Pagination Controls */}
                      <div className="d-flex justify-content-between align-items-center">
                        <button className="btn btn-outline-secondary" onClick={goPrev} disabled={currentPage === 1}>
                          Previous
                        </button>
                        <span>
                          Page {currentPage} of {totalPages} ({totalRows} rows)
                        </span>
                        <button
                          className="btn btn-outline-secondary"
                          onClick={goNext} disabled={currentPage === totalPages}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ADD SCHOOL MODAL */}
      {showAddModal && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add School</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                {["name", "district", "cluster", "block", "pin_code", "code"].map((field) => (
                  <div className="mb-3" key={field}>
                    <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                    <input
                      type="text"
                      className="form-control"
                      value={addSchoolData[field]}
                      onChange={(e) => setAddSchoolData({ ...addSchoolData, [field]: e.target.value })}
                    />
                  </div>
                ))}
                <div className="mb-3">
                  <label className="form-label">State</label>
                  <SearchableDropdown
                    options={states}
                    placeholder="Select State"
                    value={addSchoolData.state}
                    onChange={val => {
                      // when state changes, clear city and fetch its list
                      setAddSchoolData({ ...addSchoolData, state: val, city: "" });
                      fetchCitiesForState(val);
                    }}
                    isLoading={false}
                  />
                </div>

                {/* City field */}
                <div className="mb-3">
                  <label className="form-label">City</label>
                  <SearchableDropdown
                    options={cities}
                    placeholder="Select City"
                    value={addSchoolData.city}
                    onChange={val => setAddSchoolData({ ...addSchoolData, city: val })}
                    isLoading={!cities.length}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">App Visible</label>
                  <select
                    className="form-select"
                    value={addSchoolData.app_visible}
                    onChange={(e) => setAddSchoolData({ ...addSchoolData, app_visible: e.target.value })}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Is Life Lab</label>
                  <select
                    className="form-select"
                    value={addSchoolData.is_life_lab}
                    onChange={(e) => setAddSchoolData({ ...addSchoolData, is_life_lab: e.target.value })}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Donor Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={addSchoolData.donor_name}
                    onChange={(e) =>
                      setAddSchoolData({
                        ...addSchoolData,
                        donor_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={addSchoolData.status}
                    onChange={(e) => setAddSchoolData({ ...addSchoolData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleAddSchool}>
                  Add School
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT SCHOOL MODAL */}
      {showEditModal && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit School</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                {["name", "district", "cluster", "block", "pin_code", "code"].map((field) => (
                  <div className="mb-3" key={field}>
                    <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editSchoolData[field] || ""}
                      onChange={(e) => setEditSchoolData({ ...editSchoolData, [field]: e.target.value })}
                    />
                  </div>
                ))}
                {/* State field */}
                <div className="mb-3">
                  <label className="form-label">State</label>
                  <SearchableDropdown
                    options={states}
                    placeholder="Select State"
                    value={editSchoolData.state || ""}
                    onChange={val => {
                      setEditSchoolData({ ...editSchoolData, state: val, city: "" });
                      fetchCitiesForState(val);
                    }}
                    isLoading={false}
                  />
                </div>

                {/* City field */}
                <div className="mb-3">
                  <label className="form-label">City</label>
                  <SearchableDropdown
                    options={cities}
                    placeholder="Select City"
                    value={editSchoolData.city || ""}
                    onChange={val => setEditSchoolData({ ...editSchoolData, city: val })}
                    isLoading={!cities.length}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">App Visible</label>
                  <select
                    className="form-select"
                    value={editSchoolData.app_visible || "No"}
                    onChange={(e) => setEditSchoolData({ ...editSchoolData, app_visible: e.target.value })}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Is Life Lab</label>
                  <select
                    className="form-select"
                    value={editSchoolData.is_life_lab || "No"}
                    onChange={(e) => setEditSchoolData({ ...editSchoolData, is_life_lab: e.target.value })}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Donor Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editSchoolData.donor_name || ""}
                    onChange={(e) =>
                      setEditSchoolData({
                        ...editSchoolData,
                        donor_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={editSchoolData.status || "Inactive"}
                    onChange={(e) => setEditSchoolData({ ...editSchoolData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleEditModalSave}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE SCHOOL MODAL */}
      {showDeleteModal && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete School</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete this school?
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleDeleteConfirm}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ADD SCHOOL VIA CSV MODAL */}
      {showCsvModal && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Upload Schools CSV</h5>
                <button type="button" className="btn-close" onClick={() => setShowCsvModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Select CSV File</label>
                  <input 
                    type="file" 
                    className="form-control"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  />
                  <div className="form-text">
                    CSV format (required columns):<br/>
                    school_name, state_name, city_name, district_name, block_name,<br/> 
                    cluster_name, pin_code, school_code, donor_name, app_visible, is_life_lab, status<br/>
                    <small className="text-muted">
                      Note: app_visible and is_life_lab values should be - yes or no
                    </small>
                  </div>
                </div>
                {uploadStatus && <div className="alert alert-info">{uploadStatus}</div>}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowCsvModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleCsvUpload}
                  disabled={!csvFile || !!uploadStatus}
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
