'use client'
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Inter } from 'next/font/google';
import { Sidebar } from '@/components/ui/sidebar';
import '@tabler/core/dist/css/tabler.min.css';
import NumberFlow from '@number-flow/react';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { ChevronDown, Download } from 'lucide-react';
const inter = Inter({ subsets: ['latin'] });

// const api_startpoint = "http://localhost:5000";
// const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
// const api_startpoint = "http://152.42.239.141:5000";
// const api_startpoint = "http://152.42.239.141:5000";
const api_startpoint = "https://admin-api.life-lab.org";

interface StatCardProps {
  title: string;
  value: string | number;
}

interface FilterState {
  school: string;
  grade: string;
  state: string;
  city: string;
  Company: string;
  Session: string;
  SessionBooked: string;
  SessionCompleted: string;
  startDate: string;
  endDate: string;
  mobileNumber: string;
  mentorCode: string;
}

interface TableData {
  id: number;
  name: string;
  email: string;
  mobile: string;
  Mentorcode: string;
  Company: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => (
  <div className="bg-white rounded-sm border-2 border-gray-150 p-3">
    <div className="flex items-center justify-between mb-1">
      <h6 className="text-gray-400 text-sm font-medium">{title}</h6>
    </div>
    <p className="text-2xl font-medium text-gray-800">{value.toLocaleString()}</p>
  </div>
);


interface Mentor {
    state: string;
    city: string;
    gender: string;
    dob: string;
    id: number;
    name: string;
    email: string;
    mobile_no: string;
    pin: string;
}

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
    maxDisplayItems = 100
}: SearchableDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [displayedItems, setDisplayedItems] = useState(maxDisplayItems);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    
    // Implement debounce for search
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        
        searchTimeoutRef.current = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            // Reset displayed items when search changes
            setDisplayedItems(maxDisplayItems);
        }, 300);
        
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchTerm, maxDisplayItems]);

    // Get filtered options based on search term
    const filteredOptions = useMemo(() => {
        if (!debouncedSearchTerm.trim()) {
            return options;
        }
        
        const searchLower = debouncedSearchTerm.toLowerCase();
        
        return options.filter(option => 
            typeof option === "string" && 
            option.toLowerCase().includes(searchLower)
        );
    }, [options, debouncedSearchTerm]);

    // Handle scroll event to implement infinite scrolling
    const handleScroll = useCallback(() => {
        if (!scrollContainerRef.current) return;
        
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        const scrollPosition = scrollTop + clientHeight;
        
        // If user has scrolled to near bottom, load more items
        if (scrollHeight - scrollPosition < 50 && displayedItems < filteredOptions.length) {
            setDisplayedItems(prev => Math.min(prev + maxDisplayItems, filteredOptions.length));
        }
    }, [displayedItems, filteredOptions.length, maxDisplayItems]);

    // Add scroll event listener
    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll);
        }
        
        return () => {
            if (scrollContainer) {
                scrollContainer.removeEventListener('scroll', handleScroll);
            }
        };
    }, [handleScroll]);

    // Handle clicks outside the dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (option: string) => {
        onChange(option);
        setIsOpen(false);
        setSearchTerm("");
        setDebouncedSearchTerm("");
        setDisplayedItems(maxDisplayItems);
    };

    // The options to display - limited by displayedItems count
    const visibleOptions = useMemo(() => {
        return filteredOptions.slice(0, displayedItems);
    }, [filteredOptions, displayedItems]);

    // Calculate if there are more items to load
    const hasMoreItems = filteredOptions.length > displayedItems;
  
    return (
        <div className="relative" ref={dropdownRef}>
            <div
                className="flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                onClick={() => setIsOpen(!isOpen)}
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <span className={value ? "text-gray-900" : "text-gray-500"}>
                    {isLoading ? "Loading..." : (value || placeholder)}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500"/>
            </div>

            {isOpen && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                    <div className="p-2">
                        <input
                            type="text"
                            className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-purple-500 focus:outline-none"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                        />
                    </div>
                    <div 
                        className="max-h-48 overflow-auto"
                        ref={scrollContainerRef}
                    >
                        {isLoading ? (
                            <div className="px-3 py-2 text-gray-500">Loading options...</div>
                        ) : (
                            <>
                                {visibleOptions.length > 0 ? (
                                    visibleOptions.map((option, index) => (
                                        <div
                                            key={index}
                                            className="cursor-pointer px-3 py-2 text-gray-900 hover:bg-purple-50"
                                            onClick={() => handleSelect(option)}
                                        >
                                            {option}
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-3 py-2 text-gray-500">No results found</div>
                                )}
                                
                                {/* Show loading more indicator */}
                                {hasMoreItems && (
                                    <div className="flex items-center justify-center px-3 py-2 text-gray-500 border-t border-gray-100 bg-gray-50">
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-purple-500"></div>
                                        <span>Loading more... ({visibleOptions.length} of {filteredOptions.length})</span>
                                    </div>
                                )}
                                
                                {/* Show total count if filtered */}
                                {debouncedSearchTerm && filteredOptions.length > 0 && (
                                    <div className="px-3 py-2 text-xs text-center text-gray-500 bg-gray-50 border-t border-gray-100">
                                        Found {filteredOptions.length} matching results
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

export default function MentorsDashboard() {
  const [filters, setFilters] = useState<FilterState>({
    school: '',
    grade: '',
    state: '',
    city: '',
    Company: '',
    Session: '',
    SessionBooked: '',
    SessionCompleted: '',
    startDate: '',
    endDate: '',
    mobileNumber: '',
    mentorCode: ''
  });

  const [filterState, setFilterState] = useState("");
  const stats = [
    { title: 'TOTAL DOWNLOADS BY MENTORS', value: 128991 },
    { title: 'TOTAL NUMBER OF MENTORS', value: 0 },
    { title: 'TOTAL NUMBER OF ACTIVE MENTORS', value: 0 },
    { title: 'TOTAL NUMBER OF INACTIVE MENTORS', value: 0 },
    { title: 'TOTAL NUMBER OF CHALLENGES CMPLETED BY STUDENTS AND ASSESSED BY TEACHERS', value: 1395665 }
  ];

  const tableData: TableData[] = [
    {
      id: 132470,
      name: 'Live Teacher',
      email: '',
      mobile: '1234567890',
      Mentorcode: '1',
      Company: 'xyz'
    }
  ];

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // const handleClear = () => {
  //   setFilters({
  //     school: '',
  //     grade: '',
  //     state: '',
  //     city: '',
  //     Company: '',
  //     Session: '',
  //     SessionBooked: '',
  //     SessionCompleted: '',
  //     startDate: '',
  //     endDate: '',
  //     mobileNumber: '',
  //     mentorCode: ''
  //   });
  // };

  const handleClear = () => {
    setFilterState("");
    setFilters({
      school: '',
      grade: '',
      state: '',
      city: '',
      Company: '',
      Session: '',
      SessionBooked: '',
      SessionCompleted: '',
      startDate: '',
      endDate: '',
      mobileNumber: '',
      mentorCode: ''
    });
    
    // Use empty values directly in the fetch call
    fetch(`${api_startpoint}/api/mentors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        state: '',
        mobile_no: '',
        mentor_code: ''
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setMentors(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching mentors:", error);
        setLoading(false);
      });
  };
  

  const handleSearch = () => {
    console.log('Searching with filters:', filters);
  };

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMentor, setNewMentor] = useState({
    name: '',
    email: '',
    mobile_no: '',
    pin: '',
    board_name: '',
    school_code: '',
    user_rank: '',
    created_by: '',
    la_grade_id: '',
    la_board_id: '',
    la_section_id: '',
    device_token: '',
    device: '',
    updated_at: '',
    created_at: '',
    remember_token: '',
    otp: '',
    image_path: '',
    profile_image: '',
    brain_coins: '',
    heart_coins: '',
    earn_coins: '',
    password: '',
    address: '',
    state: '',
    city: '',
    grade: '',
    gender: '',
    dob: '',
    type: '4',
    username: '',
    guardian_name: '',
    school_id: ''
  });

  const [loading, setLoading] = useState(true); // <-- Add this state
  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = () => {
    setLoading(true);
    // Construct payload including new filters
    const payload = {
      state: filters.state,          // the mentor's state filter
      mobile_no: filters.mobileNumber, // use the same key your backend expects (e.g., mobile_no)
      mentor_code: filters.mentorCode  // e.g., this might map to mentor.pin
      // add any extra filters if needed
    };
  
    fetch(`${api_startpoint}/api/mentors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        setMentors(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching mentors:", error);
        setLoading(false);
      });
  };
  

  const addMentor = () => {
    fetch(`${api_startpoint}/api/add_mentor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newMentor),
    })
      .then((response) => response.json())
      .then(() => {
        fetchMentors();
        setShowAddModal(false);
      })
      .catch((error) => console.error('Error adding mentor:', error));
  };

    const [selectedState, setSelectedState] = useState("");
    const [states, setStates] = useState<string[]>([]);
    const [isStatesLoading, setIsStatesLoading] = useState(false);

    useEffect(() => {
        async function fetchStates() {
            // Check cache first
            const cachedStates = sessionStorage.getItem('stateList');
            if (cachedStates) {
                setStates(JSON.parse(cachedStates));
                return;
            }
            
            setIsStatesLoading(true);
            try {
                const res = await fetch(`${api_startpoint}/api/state_list`);
                const data: { state: string }[] = await res.json();
                
                if (Array.isArray(data)) {
                    const stateList = data
                        .map((item) => (item.state ? item.state.trim() : ""))
                        .filter(state => state !== ""); // Filter out empty states
                    
                    setStates(stateList);
                    // Cache the results
                    sessionStorage.setItem('stateList', JSON.stringify(stateList));
                } else {
                    console.error("Unexpected API response format:", data);
                    setStates([]);
                }
            } catch (error) {
                console.error("Error fetching state list:", error);
                setStates([]);
            } finally {
                setIsStatesLoading(false);
            }
        }
        
        fetchStates();
    }, []);

    // For city fetching - optimized but independent of state
    const [cities, setCities] = useState<string[]>([]);
    const [isCitiesLoading, setIsCitiesLoading] = useState(false);
    const [selectedCity, setSelectedCity] = useState("");
    const fetchCities = async (state: string) => {
        if (!state) return;
    
        console.log("Fetching cities for state:", state);
    
        setIsCitiesLoading(true);
        try {
            const res = await fetch(`${api_startpoint}/api/city_list_teachers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ state: state })
            });
    
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
    
            const data = await res.json();
    
            console.log("Raw API Response:", data); // ✅ Check if cities are being received
    
            if (Array.isArray(data) && data.length > 0) {
                const cityList: string[] = data.map(city => 
                    typeof city === 'string' ? city.trim() : city.city ? city.city.trim() : ''
                ).filter(city => city !== "");
    
                setCities(cityList);
                sessionStorage.setItem(`cityList_${state}`, JSON.stringify(cityList));
    
                console.log(`✅ Loaded ${cityList.length} cities for ${state}`);
            } else {
                console.warn("⚠ No cities found for state:", state);
                setCities([]); // Clear cities if none found
            }
        } catch (error) {
            console.error("❌ Error fetching city list:", error);
            setCities([]);
        } finally {
            setIsCitiesLoading(false);
        }
    };
    
    useEffect(() => {
        if (selectedState) {
            console.log("🟢 State changed to:", selectedState);
            setCities([]); // Reset cities when state changes
            setSelectedCity(""); // Reset selected city
            fetchCities(selectedState);
        }
    }, [selectedState]);

  // Add these state variables near your other state definitions:
  const [showEditModal, setShowEditModal] = useState(false);
  const [editMentor, setEditMentor] = useState({
    id: 0,
    name: '',
    email: '',
    mobile_no: '',
    pin: '',
    state: '',
    city: '',
    gender: '',
    dob: ''
  });

  // Function to open the edit modal and pre-fill the mentor data:
  const openEditModal = (mentor: Mentor) => {
    setEditMentor({
      id: mentor.id,
      name: mentor.name,
      email: mentor.email,
      mobile_no: mentor.mobile_no,
      pin: mentor.pin,
      state: mentor.state || '', // Make sure these fields exist in your mentor object or adjust accordingly
      city: mentor.city || '',
      gender: mentor.gender || '',
      dob: mentor.dob || ''
    });
    setShowEditModal(true);
  };

  // Function to update the mentor via the API:
  const updateMentor = () => {
    fetch(`${api_startpoint}/api/update_mentor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editMentor),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          fetchMentors();
          setShowEditModal(false);
        } else {
          console.error('Update error:', data.error);
          alert('Error updating mentor');
        }
      })
      .catch((error) => console.error('Error updating mentor:', error));
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMentorId, setDeleteMentorId] = useState<number | null>(null);

  const openDeleteModal = (id: number) => {
    setDeleteMentorId(id);
    setShowDeleteModal(true);
  };

  const deleteMentor = () => {
    if (!deleteMentorId) return;
  
    fetch(`${api_startpoint}/api/delete_mentor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: deleteMentorId }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          fetchMentors(); // Refresh mentor list
          setShowDeleteModal(false);
        } else {
          console.error('Delete error:', data.error);
          alert('Error deleting mentor');
        }
      })
      .catch((error) => console.error('Error deleting mentor:', error));
  };

  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const handleCsvUpload = async () => {
    if (!csvFile) return;
  
    const formData = new FormData();
    formData.append('csv', csvFile);
  
    try {
      setUploadStatus('Uploading...');
      const res = await fetch(`${api_startpoint}/api/upload_mentors_csv`, {
        method: 'POST',
        body: formData,
      });
  
      if (!res.ok) throw new Error(await res.text());
      
      setUploadStatus('Upload successful!');
      setTimeout(() => {
        setShowCsvModal(false);
        fetchMentors(); // Refresh the list
      }, 1500);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('Upload failed. Please check the file format.');
    }
  };
  
  const mentorsCsvTemplate =
  "name,email,mobile_no,mentor_code\n";

  const downloadMentorsCsvTemplate = () => {
    const blob = new Blob([mentorsCsvTemplate], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', 'mentors_template.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`page bg-body ${inter.className} font-sans`}>
        <Sidebar />
      <div className="page-wrapper" style={{ marginLeft: '250px' }}>
        <div className='page-body'>
          <div className='container-xl pt-4 pb-4 space-y-4'>
            <h2 className="text-xl font-semibold mb-0">Mentors List</h2>
            {/* Count Card */}
            <div className="mb-4 d-flex flex-row gap-2">
                <div className="bg-white rounded-sm border p-3 shadow-sm w-[10%] h-[10%]">
                  <h6 className="text-sm text-gray-500">Total Mentors</h6>
                  <p className="text-2xl font-bold text-gray-800">{mentors.length}</p>
                </div>
                <div className="flex justify-center justify-items-center w-3/6 h-1/2 gap-2">
                  <button className="btn btn-primary text-center mb-0 " onClick={() => setShowAddModal(true)}>
                    <IconPlus size={18} /> Add Mentor
                  </button>
                  <button 
                    className="btn btn-info text-center mb-0 text-white"
                    onClick={() => setShowCsvModal(true)}
                  >
                    <IconPlus size={18} /> Upload CSV
                  </button>
                  <button
                    className="btn btn-secondary d-inline-flex align-items-center"
                    onClick={downloadMentorsCsvTemplate}
                  >
                    <Download className="me-2" size={16} /> Download CSV Template
                  </button>
                </div>
                
            </div>
            
            <div className="mb-4">
              

              {/* Filters Section */}
              <div className="flex flex-row gap-4">
                {/* State Filter */}
                <div>
                  <label className="form-label">State</label>
                  {/* <input
                    type="text"
                    className="form-control"
                    placeholder="Enter State"
                    value={filters.state}
                    onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
                  /> */}
                  <SearchableDropdown
                    options={states}
                    placeholder="Select State"
                    value={filterState}
                    onChange={(value) => {
                      setFilterState(value);
                      setFilters(prev => ({ ...prev, state: value }));
                    }}
                    isLoading={isStatesLoading}
                    maxDisplayItems={200}
                  />

                </div>
                {/* Mobile Number Filter */}
                <div>
                  <label className="form-label">Mobile No</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Mobile Number"
                    value={filters.mobileNumber}
                    onChange={(e) => setFilters(prev => ({ ...prev, mobileNumber: e.target.value }))}
                  />
                </div>
                {/* Mentor Code Filter */}
                <div>
                  <label className="form-label">Mentor Code</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Mentor Code"
                    value={filters.mentorCode}
                    onChange={(e) => setFilters(prev => ({ ...prev, mentorCode: e.target.value }))}
                  />
                </div>
              </div>
              {/* Search & Clear Buttons */}
              <div className="flex gap-4 mt-4">
                <button className="btn btn-success" onClick={fetchMentors}>
                  Search
                </button>
                <button
                  className="btn btn-warning"
                  onClick={() => {
                    handleClear();
                    handleClear();
                    fetchMentors();
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="card">
              <div className="table-responsive">
              {loading ? (
              <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-800"></div>
              </div>
              ) : (
                <table className="table table-vcenter card-table w-full table-auto">
                  <thead>
                    <tr>
                      <th  className=" text-left text-xs font-medium text-gray-500 uppercase tracking-wider" >ID</th>
                      <th className=" text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className=" text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className=" text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                      <th className=" text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentor-Code</th>
                      <th className=" text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DOB</th>
                      <th className=" text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                      <th className=" text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                      <th className=" text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                      <th className=" text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mentors.map((mentor) => (
                      <tr key={mentor.id}>
                        <td className=" whitespace-nowrap text-sm text-gray-900" >{mentor.id}</td>
                        <td className=" whitespace-nowrap text-sm text-gray-900">{mentor.name}</td>
                        <td className=" whitespace-nowrap text-sm text-gray-900">{mentor.email}</td>
                        <td className=" whitespace-nowrap text-sm text-gray-900">{mentor.mobile_no}</td>
                        <td className=" whitespace-nowrap text-sm text-gray-900">{mentor.pin}</td>
                        <td className=" whitespace-nowrap text-sm text-gray-900">{mentor.dob}</td>
                        <td className=" whitespace-nowrap text-sm text-gray-900">{mentor.gender}</td>
                        <td className=" whitespace-nowrap text-sm text-gray-900">{mentor.state}</td>
                        <td className=" whitespace-nowrap text-sm text-gray-900">{mentor.city}</td>
                        <td className=" whitespace-nowrap text-sm text-gray-900">
                          <div className="btn-list">
                            <button className="btn btn-icon btn-primary"
                              onClick={() => openEditModal(mentor)} >
                              <IconEdit size={18} />
                            </button>
                            <button className="btn btn-icon btn-danger"
                              onClick={() => openDeleteModal(mentor.id)} >
                              <IconTrash size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                )}
              </div>
            </div>
            {showAddModal && (
              <div className="modal d-block mt-0" tabIndex={-1}
                style={{ 
                    background: 'rgba(0,0,0,0.5)', 
                    position: 'fixed', 
                    top: 0, left: 0, 
                    paddingTop:0,
                    width: '100vw', height: '100vh', 
                    zIndex: 1050 
                }}
                >
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Add Mentor</h5>
                      <button className="btn-close" onClick={() => setShowAddModal(false)}></button>
                    </div>
                    <div className="modal-body">
                        <div className="mb-2">
                            <label className="form-label">Name</label>
                            <input className="form-control" placeholder="Name" onChange={(e) => setNewMentor({ ...newMentor, name: e.target.value })} />
                        </div>
                        <div className="mb-2">
                            <label className="form-label">Email</label>
                            <input className="form-control" placeholder="Email" onChange={(e) => setNewMentor({ ...newMentor, email: e.target.value })} />
                        </div>
                        <div className="mb-2">
                            <label className="form-label">Mobile No</label>
                            <input className="form-control" placeholder="Mobile" onChange={(e) => setNewMentor({ ...newMentor, mobile_no: e.target.value })} />
                        </div>
                        <div className="mb-2">
                            <label className="form-label">Mentor Code</label>
                            <input className="form-control" placeholder="Mentor Code" onChange={(e) => setNewMentor({ ...newMentor, pin: e.target.value })} />
                        </div>
                        <div className="    mb-2">
                            <label className="form-label">State</label>
                            <SearchableDropdown
                                options={states}
                                placeholder="Select State"
                                value={selectedState}
                                onChange={(value) => {
                                    setSelectedState(value);
                                    setNewMentor(prev => ({ ...prev, state: value })); // Update newMentor
                                }}
                                isLoading={isStatesLoading}
                                maxDisplayItems={200}
                                
                            />
                        </div>
                        <div className="mb-2">
                            <label className="form-label">City</label>
                            <SearchableDropdown
                                options={cities}
                                placeholder="Select city"
                                value={selectedCity}
                                onChange={(value) => {
                                    setSelectedCity(value);
                                    setNewMentor(prev => ({ ...prev, city: value })); // Update newMentor
                                }}
                                isLoading={isCitiesLoading}
                                maxDisplayItems={200}
                            />
                        </div>
                        <div className="mb-2">
                            <label className="form-label">Date of Birth</label>
                            <input
                                type="date"
                                placeholder="Date of Birth"
                                className="form-control"
                                // value={selectedToDate}
                                onChange={(e) => setNewMentor({ ...newMentor, dob: e.target.value })}
                            />
                        </div>
                        <div className="mb-2">
                            <label className="form-label">Gender</label>
                            <select 
                                className="form-select" 
                                aria-placeholder='Gender'
                                //value={newSection.status} 
                                onChange={(e) => setNewMentor({ ...newMentor, gender: e.target.value })}>
                                <option value='0'>Male</option>
                                <option value='1'>Female</option>
                            </select>
                        </div>
                      {/* Add other fields as needed */}
                    </div>
                    <div className="modal-footer">
                      <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Close</button>
                      <button className="btn btn-primary" onClick={addMentor}>Save</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* // Add the Edit Modal below your Add Modal code: */}
            {showEditModal && (
              <div className="modal d-block mt-0" tabIndex={-1}
                style={{ 
                  background: 'rgba(0,0,0,0.5)', 
                  position: 'fixed', 
                  top: 0, left: 0, 
                  width: '100vw', height: '100vh', 
                  zIndex: 1050 
                }}
              >
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Edit Mentor</h5>
                      <button className="btn-close" onClick={() => setShowEditModal(false)}></button>
                    </div>
                    <div className="modal-body">
                      <input 
                        className="form-control mb-2" 
                        placeholder="Name" 
                        value={editMentor.name}
                        onChange={(e) => setEditMentor({ ...editMentor, name: e.target.value })} 
                      />
                      <input 
                        className="form-control mb-2" 
                        placeholder="Email" 
                        value={editMentor.email}
                        onChange={(e) => setEditMentor({ ...editMentor, email: e.target.value })} 
                      />
                      <input 
                        className="form-control mb-2" 
                        placeholder="Mobile" 
                        value={editMentor.mobile_no}
                        onChange={(e) => setEditMentor({ ...editMentor, mobile_no: e.target.value })} 
                      />
                      <input 
                        className="form-control mb-2" 
                        placeholder="Mentor Code" 
                        value={editMentor.pin}
                        onChange={(e) => setEditMentor({ ...editMentor, pin: e.target.value })} 
                      />
                      {/* You can include the dropdowns for state and city here as well */}
                      <div className="mb-2">
                        <SearchableDropdown
                          options={states}
                          placeholder="Select State"
                          value={editMentor.state}
                          onChange={(value) => setEditMentor(prev => ({ ...prev, state: value }))}
                          isLoading={isStatesLoading}
                          maxDisplayItems={200}
                        />
                      </div>
                      <div className="mb-2">
                        <SearchableDropdown
                          options={cities}
                          placeholder="Select City"
                          value={editMentor.city}
                          onChange={(value) => setEditMentor(prev => ({ ...prev, city: value }))}
                          isLoading={isCitiesLoading}
                          maxDisplayItems={200}
                        />
                      </div>
                      <div className="mb-2">
                        <input
                          type="date"
                          className="form-control"
                          value={editMentor.dob}
                          onChange={(e) => setEditMentor({ ...editMentor, dob: e.target.value })}
                        />
                      </div>
                      <div className="mb-2">
                        <select 
                          className="form-select"
                          value={editMentor.gender}
                          onChange={(e) => setEditMentor({ ...editMentor, gender: e.target.value })}
                        >
                          <option value='0'>Male</option>
                          <option value='1'>Female</option>
                        </select>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Close</button>
                      <button className="btn btn-primary" onClick={updateMentor}>Save Changes</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {showDeleteModal && (
              <div className="modal d-block mt-0"
                style={{ background: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1050 }}
              >
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Confirm Deletion</h5>
                      <button className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
                    </div>
                    <div className="modal-body">
                      <p>Are you sure you want to delete this mentor?</p>
                    </div>
                    <div className="modal-footer">
                      <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                      <button className="btn btn-danger" onClick={deleteMentor}>Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showCsvModal && (
              <div className="modal fade show mt-0" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Upload Mentors CSV</h5>
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
                          CSV format: name,email,mobile_no,mentor_code
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
        </div>
      </div>
    </div>
    // <div className="min-h-screen bg-gray-100 p-8">
    //   <div className="max-w-7xl mx-auto">
    //     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    //       {stats.map((stat, index) => (
    //         <StatCard key={index} title={stat.title} value={stat.value} />
    //       ))}
    //     </div>
    //     <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
    //       <h2 className="text-xl font-semibold text-gray-800 mb-6">Search & Filter</h2>
    //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    //         <select
    //           className="w-full p-2 border border-gray-300 rounded-md"
    //           value={filters.school}
    //           onChange={(e) => handleFilterChange('school', e.target.value)}
    //         >
    //           <option value="">Select School</option>
    //         </select>

    //         <select
    //           className="w-full p-2 border border-gray-300 rounded-md"
    //           value={filters.grade}
    //           onChange={(e) => handleFilterChange('grade', e.target.value)}
    //         >
    //           <option value="">Select Grade</option>
    //         </select>

    //         <select
    //           className="w-full p-2 border border-gray-300 rounded-md"
    //           value={filters.state}
    //           onChange={(e) => handleFilterChange('state', e.target.value)}
    //         >
    //           <option value="">Select State</option>
    //         </select>

    //         <select
    //           className="w-full p-2 border border-gray-300 rounded-md"
    //           value={filters.city}
    //           onChange={(e) => handleFilterChange('city', e.target.value)}
    //         >
    //           <option value="">Select city</option>
    //         </select>

    //         <select
    //           className="w-full p-2 border border-gray-300 rounded-md"
    //           value={filters.Company}
    //           onChange={(e) => handleFilterChange('Company', e.target.value)}
    //         >
    //           <option value="">Company</option>
    //         </select>

    //         <select
    //           className="w-full p-2 border border-gray-300 rounded-md"
    //           value={filters.Session}
    //           onChange={(e) => handleFilterChange('Session', e.target.value)}
    //         >
    //           <option value="">Session</option>
    //         </select>

    //         <select
    //           className="w-full p-2 border border-gray-300 rounded-md"
    //           value={filters.SessionBooked}
    //           onChange={(e) => handleFilterChange('SessionBooked', e.target.value)}
    //         >
    //           <option value="">Session Booked</option>
    //           <option value="">True</option>
    //           <option value="">False</option>
    //         </select>
    //         <select
    //           className="w-full p-2 border border-gray-300 rounded-md"
    //           value={filters.SessionCompleted}
    //           onChange={(e) => handleFilterChange('SessionCompleted', e.target.value)}
    //         >
    //           <option value="">Session Completed</option>
    //           <option value="">True</option>
    //           <option value="">False</option>
    //         </select>
    //       </div>

    //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    //         <input
    //           type="date"
    //           className="w-full p-2 border border-gray-300 rounded-md"
    //           value={filters.startDate}
    //           onChange={(e) => handleFilterChange('startDate', e.target.value)}
    //           placeholder="Start Date"
    //         />

    //         <input
    //           type="date"
    //           className="w-full p-2 border border-gray-300 rounded-md"
    //           value={filters.endDate}
    //           onChange={(e) => handleFilterChange('endDate', e.target.value)}
    //           placeholder="End Date"
    //         />

    //         <input
    //           type="text"
    //           className="w-full p-2 border border-gray-300 rounded-md"
    //           value={filters.mobileNumber}
    //           onChange={(e) => handleFilterChange('mobileNumber', e.target.value)}
    //           placeholder="Search With Mobile Number"
    //         />
    //       </div>

    //       <div className="flex gap-4">
    //         <button
    //           onClick={handleSearch}
    //           className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
    //         >
    //           Search
    //         </button>
    //         <button
    //           onClick={handleClear}
    //           className="px-6 py-2 bg-orange-500 text-black rounded-md hover:bg-orange-600 transition-colors"
    //         >
    //           Clear
    //         </button>
    //       </div>
    //     </div>
    //     <div className="bg-white rounded-lg shadow-sm p-6">
    //       <div className="overflow-x-auto">
    //         <table className="min-w-full divide-y divide-gray-200">
    //           <thead className="bg-gray-50">
    //             <tr>
    //               <th className=" text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
    //               <th className=" text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
    //               <th className=" text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
    //               <th className=" text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
    //               <th className=" text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentor Code</th>
    //               <th className=" text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
    //               <th className=" text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
    //             </tr>
    //           </thead>
    //           <tbody className="bg-white divide-y divide-gray-200">
    //             {tableData.map((row) => (
    //               <tr key={row.id}>
    //                 <td className=" whitespace-nowrap text-sm text-gray-900">{row.id}</td>
    //                 <td className=" whitespace-nowrap text-sm text-gray-900">{row.name}</td>
    //                 <td className=" whitespace-nowrap text-sm text-gray-900">{row.email}</td>
    //                 <td className=" whitespace-nowrap text-sm text-gray-900">{row.mobile}</td>
    //                 <td className=" whitespace-nowrap text-sm text-gray-900">{row.Mentorcode}</td>
    //                 <td className=" whitespace-nowrap text-sm text-gray-900">{row.Company}</td>
    //                 <td className=" whitespace-nowrap text-sm text-gray-900">
    //                   <div className="flex space-x-2">
    //                     <button className="text-blue-600 hover:text-blue-800">
    //                       <span className="sr-only">Edit</span>
    //                       ✏️
    //                     </button>
    //                     <button className="text-red-600 hover:text-red-800">
    //                       <span className="sr-only">Delete</span>
    //                       🗑️
    //                     </button>
    //                   </div>
    //                 </td>
    //               </tr>
    //             ))}
    //           </tbody>
    //         </table>
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
}

