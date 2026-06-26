// // frontend/src/components/TicketDetailsModal.jsx

// import React from 'react';
// import Modal from 'react-modal';
// import { FaTimes } from 'react-icons/fa';
// import { format } from 'date-fns';
// import ticketService from '../services/ticketService.js'; // For BASE_URL

// Modal.setAppElement('#root'); // Ensure this is set once in main.jsx or App.jsx

// const TicketDetailsModal = ({ isOpen, onRequestClose, ticket }) => {
//   if (!ticket) {
//     return null; // Don't render if no ticket is provided
//   }

//   return (
//     <Modal
//       isOpen={isOpen}
//       onRequestClose={onRequestClose}
//       contentLabel="Ticket Details"
//       className="modal-content"
//       overlayClassName="modal-overlay"
//     >
//       <div className="modal-header">
//         <h2>Ticket Details</h2>
//         <button onClick={onRequestClose} className="modal-close-button"><FaTimes /></button>
//       </div>
//       <div className="ticket-details-content">
//         <p><strong>Ticket ID:</strong> {ticket.id}</p>
//         <p><strong>Title:</strong> {ticket.title}</p>
//         <p><strong>Category:</strong> {ticket.category}</p>
//         <p><strong>Status:</strong> {ticket.status}</p>
//         <p><strong>Created:</strong> {format(new Date(ticket.created), 'MMM dd, yyyy, p')}</p>
//         <p><strong>Description:</strong></p>
//         <p style={{whiteSpace: 'pre-wrap'}}>{ticket.description}</p> {/* pre-wrap to preserve formatting */}

//         {ticket.image_url && (
//           <div style={{ marginTop: '15px' }}>
//             <strong>Attached Image:</strong><br/>
//             <a 
//               href={`${ticketService.BASE_URL}${ticket.image_url}`} 
//               target="_blank" 
//               rel="noopener noreferrer"
//             >
//               <img 
//                 src={`${ticketService.BASE_URL}${ticket.image_url}`} 
//                 alt="Attached Ticket" 
//                 style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', marginTop: '10px', border: '1px solid var(--dark-border)' }} 
//               />
//             </a>
//             <p style={{ fontSize: '0.9em', color: 'var(--text-secondary)' }}>Click image to view full size.</p>
//           </div>
//         )}
//       </div>
//       <div className="modal-footer">
//         <button onClick={onRequestClose} className="btn btn-secondary">Close</button>
//       </div>
//     </Modal>
//   );
// };

// export default TicketDetailsModal;