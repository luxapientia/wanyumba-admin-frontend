import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Search, Phone, Mail, Calendar, Trash2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  setPage,
  setPageSize,
  setFilters,
  setSorting,
} from '../../store/slices/agentsSlice';
import { fetchAgents, deleteAgentById } from '../../store/thunks/agentsThunks';
import { Input, Table, Pagination, AnimatedPage } from '../../components/UI';
import type { Column } from '../../components/UI/Table';
import type { Agent } from '../../api/scraper.service';
import { useToast } from '../../contexts/ToastContext';
import { ConfirmationModal } from '../../components/UI';

const Agents = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { success, error: showError } = useToast();
  const { items, total, page, pageSize, loading, filters, sortBy, sortOrder } =
    useAppSelector((state) => state.agents);

  const [searchInput, setSearchInput] = useState(filters.search);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchAgents());
  }, [dispatch, page, pageSize, filters, sortBy, sortOrder]);

  const handleSearch = (value: string) => {
    setSearchInput(value);
    dispatch(setFilters({ search: value }));
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    dispatch(setSorting({ sortBy: key, sortOrder: direction }));
  };

  const handleDeleteClick = (id: number) => {
    setAgentToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (agentToDelete) {
      try {
        await dispatch(deleteAgentById(agentToDelete)).unwrap();
        success('Success', 'Agent deleted successfully');
        setDeleteModalOpen(false);
        setAgentToDelete(null);
        // Refresh the list
        dispatch(fetchAgents());
      } catch {
        showError('Error', 'Failed to delete agent');
        setDeleteModalOpen(false);
        setAgentToDelete(null);
      }
    }
  };

  const columns = [
    {
      key: 'id',
      header: 'ID',
      sortable: true,
      render: (_value: unknown, agent: Agent) => (
        <span className="font-mono text-sm text-gray-600">{agent.id}</span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (_value: unknown, agent: Agent) => (
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
            {agent.name ? agent.name.charAt(0).toUpperCase() : '?'}
          </div>
          <span className="font-medium text-gray-900">
            {agent.name || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      sortable: true,
      render: (_value: unknown, agent: Agent) => (
        <div className="flex items-center gap-2 text-gray-700">
          <Phone className="w-4 h-4 text-blue-500" />
          <a
            href={`tel:${agent.phone}`}
            className="hover:text-blue-600 transition-colors"
          >
            {agent.phone}
          </a>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      render: (_value: unknown, agent: Agent) => (
        <div className="flex items-center gap-2 text-gray-700">
          {agent.email ? (
            <>
              <Mail className="w-4 h-4 text-green-500" />
              <a
                href={`mailto:${agent.email}`}
                className="hover:text-green-600 transition-colors"
              >
                {agent.email}
              </a>
            </>
          ) : (
            <span className="text-gray-400">No email</span>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (_value: unknown, agent: Agent) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{new Date(agent.createdAt).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_value: unknown, agent: Agent) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(agent.id);
          }}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete agent"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <AnimatedPage className="p-4 lg:p-8 overflow-x-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Agents
            </h1>
            <p className="text-gray-600 text-sm lg:text-base">
              Manage property agents and their contact information
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">{total}</span>
            <span className="text-sm text-gray-600">Total Agents</span>
          </div>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Input
          icon={<Search className="w-5 h-5" />}
          placeholder="Search by name, phone, or email..."
          value={searchInput}
          onChange={(e) => handleSearch(e.target.value)}
          fullWidth
        />
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Table<Record<string, unknown>>
          data={items as unknown as Array<Record<string, unknown>>}
          columns={columns as unknown as Column<Record<string, unknown>>[]}
          isLoading={loading}
          emptyMessage="No agents found"
          onSort={handleSort}
          sortKey={sortBy}
          sortDirection={sortOrder}
          onRowClick={(agent) => navigate(`/scraper/agents/${(agent as unknown as Agent).id}`)}
        />
      </motion.div>

      {/* Pagination */}
      {!loading && total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(total / pageSize)}
            itemsPerPage={pageSize}
            totalItems={total}
            onPageChange={(newPage: number) => dispatch(setPage(newPage))}
            onItemsPerPageChange={(newSize: number) => dispatch(setPageSize(newSize))}
          />
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setAgentToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Agent"
        message="Are you sure you want to delete this agent? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </AnimatedPage>
  );
};

export default Agents;

