
// frontend/src/App.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaPlus, FaTicketAlt } from 'react-icons/fa';
import ticketService from './services/ticketService.js';
import authService from './services/authService'; 
import TicketTable from './components/TicketTable.jsx';
import CreateTicketModal from './components/CreateTicketModal.jsx'; 
import AuthForm from './components/AuthForm.jsx'; 
import ResetPasswordForm from './components/ResetPasswordForm.jsx'; 

import Modal from 'react-modal'; 
Modal.setAppElement('#root'); 


function App() {
  const [tickets, setTickets] = useState([]); 

  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [ticketToEdit, setTicketToEdit] = useState(null); 

  const [searchTerm, setSearchTerm] = useState(''); 
  const [filterCategory, setFilterCategory] = useState('All Categories'); 

  const [isLoggedIn, setIsLoggedIn] = useState(authService.isAuthenticated()); 
  const [loggedInUsername, setLoggedInUsername] = useState(localStorage.getItem('username') || ''); 
  
  const [resetToken, setResetToken] = useState(null); 

  // useEffect to check for reset token in URL to jandle password
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      setResetToken(token); 
    }
  }, []); 


  // Fetch tickets from the backend
  const fetchTickets = useCallback(async () => {
    if (!isLoggedIn) return; 

    try {
      const response = await ticketService.getAllTickets(searchTerm, filterCategory); 
      const sortedTickets = response.data.sort((a, b) => new Date(b.created) - new Date(a.created));
      setTickets(sortedTickets);
    } catch (error) {
      console.error("Failed to fetch tickets:", error.response?.data || error.message);
      if (error.response && error.response.status === 401) {
        handleLogout(); 
        alert("Your session has expired. Please log in again.");
      } else {
        alert(`Failed to load tickets: ${error.message}`);
      }
    }
  }, [searchTerm, filterCategory, isLoggedIn]); 


  
  useEffect(() => {
    
    if (!resetToken) {
        fetchTickets();
    }
  }, [fetchTickets, resetToken]); 


  
  const displayedTickets = useMemo(() => { 
    let currentTickets = [...tickets];
    if (filterCategory !== 'All Categories') {
      currentTickets = currentTickets.filter((ticket) => ticket.category === filterCategory);
    }
    return currentTickets;
  }, [tickets, filterCategory]);


  // search+Filter handler
  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };
  const handleSearchKeyPress = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      const idToSearch = searchTerm.trim();
      if (!idToSearch) {
        fetchTickets(); 
        return;
      }
      try {
        const response = await ticketService.getTicket(idToSearch);
        setTickets([response.data]); 
        setFilterCategory('All Categories'); 
        alert(`Ticket "${response.data.title}" (ID: ${response.data.id}) found!`);
      } catch (error) {
        console.error("Error searching for ticket by ID:", error.response?.data || error.message);
        if (error.response && error.response.status === 404) {
          setTickets([]); 
          alert(`Ticket with ID "${idToSearch}" not found.`);
        } else if (error.response && error.response.status === 401) { 
            handleLogout();
            alert("Your session has expired or is invalid. Please log in again.");
        } else {
          alert("Error searching for ticket. Please check the ID or try again.");
        }
      }
    }
  };

  const handleCategoryChange = (e) => {
    setFilterCategory(e.target.value);
  };

  const handleNewTicketClick = () => {
    setTicketToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (ticket) => {
    setTicketToEdit(ticket);
    setIsModalOpen(true);
  };

  const handleViewClick = (ticket) => {
    console.log("Viewing ticket details:", ticket);
    alert(
      `Ticket ID: ${ticket.id}\n` +
      `Title: ${ticket.title}\n` +
      `Category: ${ticket.category}\n` +
      `Status: ${ticket.status}\n` +
      `Description: ${ticket.description}\n` +
      `Created: ${new Date(ticket.created).toLocaleString()}\n` +
      `Image URL: ${ticket.image_url ? ticketService.BASE_URL + ticket.image_url : 'No Image'}`
    );
  };

  const handleDeleteTicket = async (id) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await ticketService.deleteTicket(id);
        alert('Ticket deleted successfully!');
        fetchTickets(); 
      } catch (error) {
        console.error("Failed to delete ticket:", error.response?.data || error.message);
        if (error.response && error.response.status === 401) { 
            handleLogout();
            alert("Your session has expired or is invalid. Please log in again.");
        } else {
            alert(`Failed to delete ticket: ${error.response?.data?.detail || error.message}`);
        }
      }
    }
  };

  const handleFormSuccess = useCallback(() => { 
    fetchTickets(); 
    setIsModalOpen(false); 
  }, [fetchTickets]); 


  // HAandle login sucess and logout 
  const handleAuthSuccess = useCallback((username_from_auth) => { 
    setIsLoggedIn(true); 
    setLoggedInUsername(username_from_auth); 
    fetchTickets(); 
  }, [fetchTickets]); 

  const handleLogout = useCallback(() => { 
    authService.logout(); 
    setIsLoggedIn(false); 
    setLoggedInUsername(''); 
    setTickets([]); 
  }, []); 


  

 
  if (resetToken) {
    return <ResetPasswordForm token={resetToken} />;
  }

 
  if (!isLoggedIn) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  // If logged in, render the main application dashboard
  return (
    <div className="container">
      <header className="header">
        <div className="header-title">
          <FaTicketAlt /> 
          <h1>Support Tickets</h1>
        </div>
        <div className="header-actions">
          <span>{loggedInUsername}</span> 
          <button className="btn btn-secondary" onClick={handleLogout} style={{marginLeft: '1rem'}}>
             Logout 
          </button>
          <button className="btn btn-primary" onClick={handleNewTicketClick} style={{marginLeft: '0.5rem'}}>
            <FaPlus /> New Ticket 
          </button>
        </div>
      </header>

      <main>
        <div className="card">
          <div className="card-header">
            <h2>All Tickets</h2>
            <div className="filters">
              <input 
                type="search"
                placeholder="Search tickets by ID or title..."
                value={searchTerm}
                onChange={handleSearchInputChange} 
                onKeyPress={handleSearchKeyPress}  
              />
              <select 
                value={filterCategory} 
                onChange={handleCategoryChange} 
              >
                <option value="All Categories">All Categories</option>
                <option value="Bug">Bug</option>
                <option value="Feedback">Feedback</option>
                <option value="Feature Request">Feature Request</option>
              </select>
            </div>
          </div>
          {/* TicketTable component */}
          <TicketTable 
            tickets={displayedTickets} 
            onEdit={handleEditClick} 
            onDelete={handleDeleteTicket} 
            onView={handleViewClick}
          />
        </div>
      </main>

      <CreateTicketModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        onSuccess={handleFormSuccess}
        ticketToEdit={ticketToEdit} 
      />
    </div>
  );
}

export default App;