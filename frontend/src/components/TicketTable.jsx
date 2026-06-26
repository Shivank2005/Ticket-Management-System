// frontend/src/components/TicketTable.jsx

import React, { useState } from 'react';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { format } from 'date-fns';
import ticketService from '../services/ticketService.js';

const TicketTable = ({ tickets, onEdit, onDelete, onView }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 8;

  const totalPages = Math.ceil(tickets.length / ticketsPerPage);
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = tickets.slice(indexOfFirstTicket, indexOfLastTicket);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'status-open';
      case 'in progress':
        return 'status-in-progress';
      case 'closed':
        return 'status-closed';
      default:
        return '';
    }
  };

  const getCategoryClass = (category) => {
    return category.toLowerCase() === 'bug' ? 'badge-bug' : 'badge-feedback';
  };

  return (
    <>
      <table className="ticket-table">
        <thead>
          <tr>
            <th>Ticket ID</th>
            <th>Title</th>
            <th>Category</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentTickets.map((ticket) => (
            <tr key={ticket.id}>
              <td>{ticket.id}</td>
              <td>
                {ticket.title}
                {ticket.image_url && (
                  <div style={{ marginTop: '5px' }}>
                    <a
                      href={`${ticketService.BASE_URL}${ticket.image_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--primary-blue)', textDecoration: 'none', fontSize: '0.9em' }}
                    >
                      View Image
                    </a>
                  </div>
                )}
              </td>
              <td>
                <span className={`badge ${getCategoryClass(ticket.category)}`}>
                  {ticket.category}
                </span>
              </td>
              <td>
                <span className={`badge status-badge ${getStatusClass(ticket.status)}`}>
                  {ticket.status}
                </span>
              </td>
              <td>{format(new Date(ticket.created), 'MMM dd, yyyy, p')}</td>
              <td className="table-actions">
                <FaEye className="action-icon" onClick={() => onView(ticket)} />
                <FaEdit className="action-icon" onClick={() => onEdit(ticket)} />
                <FaTrash className="action-icon action-icon-delete" onClick={() => onDelete(ticket.id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </>
  );
};

export default TicketTable;
