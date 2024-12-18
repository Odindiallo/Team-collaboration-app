import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import {
  addDocument,
  updateDocument,
  deleteDocument,
  setActiveDocument,
  Document,
} from '../redux/slices/documentSlice';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, ArrowLeftIcon } from '@heroicons/react/20/solid';
import Navigation from '../components/Navigation';

const Documents: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const dispatch = useDispatch();
  const { documents, activeDocument } = useSelector((state: RootState) => state.documents);
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const handleCreate = () => {
    if (title && content && user) {
      const newDocument: Document = {
        id: Date.now().toString(),
        title,
        content,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dispatch(addDocument(newDocument));
      setTitle('');
      setContent('');
      dispatch(setActiveDocument(null));
    }
  };

  const handleUpdate = () => {
    if (activeDocument && title && content && user) {
      const updatedDocument: Document = {
        ...activeDocument,
        title,
        content,
        updatedAt: new Date().toISOString(),
      };
      dispatch(updateDocument(updatedDocument));
      setTitle('');
      setContent('');
      dispatch(setActiveDocument(null));
    }
  };

  const handleDelete = (id: string) => {
    dispatch(deleteDocument(id));
    if (activeDocument?.id === id) {
      setTitle('');
      setContent('');
      dispatch(setActiveDocument(null));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
                title="Back to Dashboard"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            </div>
            <button
              onClick={() => navigate('/documents/new')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Document
            </button>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new document.</p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/documents/new')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  New Document
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Title</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Created</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Last Updated</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                        <div className="font-medium text-gray-900">{doc.title}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(doc.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => navigate(`/documents/${doc.id}`)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            setTitle(doc.title);
                            setContent(doc.content);
                            dispatch(setActiveDocument(doc));
                            navigate(`/documents/${doc.id}/edit`);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(doc.id);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Documents;
