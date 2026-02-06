

import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import ticketService from '../services/ticketService.js';
import { FaTimes, FaCloudUploadAlt } from 'react-icons/fa';


//ensure accessiblity for screen by defining the root app element outside
Modal.setAppElement('#root');




const CreateTicketModal = ({ isOpen, onRequestClose, onSuccess, ticketToEdit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('Open'); 
  const [selectedFile, setSelectedFile] = useState(null); 
  const [error, setError] = useState('');

  // useEffect to initialize form fields 
  useEffect(() => {
    if (isOpen) {
      if (ticketToEdit) {
        setTitle(ticketToEdit.title || '');
        setDescription(ticketToEdit.description || '');
        setCategory(ticketToEdit.category || '');
        setStatus(ticketToEdit.status || 'Open'); 
      } else {
        
        setTitle('');
        setDescription('');
        setCategory('');
        setStatus('Open'); 
      }
      setSelectedFile(null); 
      setError(''); 
    }
  }, [isOpen, ticketToEdit]);

  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!title || !description || !category) {
      setError('Title, Description, and Category are required.');
      return;
    }

    try {
      if (ticketToEdit) {
        
        const updateData = {
          title: title,
          description: description,
          category: category,
          status: status, 
          
        };
        
        await ticketService.updateTicket(ticketToEdit.id, updateData);
        alert('Ticket updated successfully!');
      } else {
        
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('status', status); 
        
        if (selectedFile) {
          formData.append('image', selectedFile);
        }

        await ticketService.createTicket(formData);
        alert('Ticket created successfully!');
      }
      
      onSuccess(); 
      onRequestClose(); 
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message;
      console.error("Form submission error:", err.response ? err.response.data : err.message, err);
      setError(`Operation failed: ${errorMessage}`);
    }
  };

  // set modal title and button t
  const modalTitle = ticketToEdit ? "Edit Ticket" : "Create New Ticket";
  const submitButtonText = ticketToEdit ? "Update Ticket" : "Create Ticket";

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel={modalTitle}
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <div className="modal-header">
        <h2>{modalTitle}</h2>
        <button onClick={onRequestClose} className="modal-close-button"><FaTimes /></button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter ticket title"
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="" disabled>Select Category</option>
            <option value="Bug">Bug</option>
            <option value="Feedback">Feedback</option>
            <option value="Feature Request">Feature Request</option>
            <option value="support">Support</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your issue or feedback..."
          ></textarea>
        </div>
        
        {/* Status field ONLY FOR EDIT MODE */}
        {ticketToEdit && (
            <div className="form-group">
                <label htmlFor="status">Status</label>
                <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                </select>
            </div>
        )}

        {/* Image Upload Section - only for CREATE mode */}
        {!ticketToEdit && (
          <div className="form-group">
            <label htmlFor="imageUpload">Upload Image (Optional)</label>
            <div className="file-upload-area">
              <input
                type="file"
                id="imageUpload"
                accept="image/jpeg, image/png, image/gif"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="imageUpload" className="btn btn-secondary upload-btn">
                <FaCloudUploadAlt /> Choose File
              </label>
              {selectedFile && (
                  <span style={{ marginLeft: '10px' }}>{selectedFile.name}</span>
              )}
            </div>
          </div>
        )}

        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
        
        <div className="modal-footer">
          <button type="button" onClick={onRequestClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {submitButtonText}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTicketModal;