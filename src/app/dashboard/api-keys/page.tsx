'use client';

import { useEffect, useState } from 'react';
import { ApiKey, apiKeysService } from '@/services/apiKeys';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useToast } from '@/components/ui/use-toast';
import { ApiKeyDialog } from '@/components/api-keys/ApiKeyDialog';
import { useUser } from '@/contexts/UserContext';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const isAdmin = user?.role === 'admin';

  const fetchApiKeys = async () => {
    try {
      const data = await (isAdmin ? apiKeysService.getAllAdmin() : apiKeysService.getAll());
      setApiKeys(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch API keys',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, [isAdmin]);

  const handleCreate = () => {
    setSelectedKey(null);
    setIsDialogOpen(true);
  };

  const handleRevoke = async (id: number) => {
    if (!confirm('Are you sure you want to revoke this API key?')) {
      return;
    }

    try {
      await apiKeysService.revoke(id);
      toast({
        title: 'Success',
        description: 'API key revoked successfully',
      });
      fetchApiKeys();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to revoke API key',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this API key?')) {
      return;
    }

    try {
      await apiKeysService.delete(id);
      toast({
        title: 'Success',
        description: 'API key deleted successfully',
      });
      fetchApiKeys();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete API key',
        variant: 'destructive',
      });
    }
  };

  const handleDialogClose = (success?: boolean) => {
    setIsDialogOpen(false);
    if (success) {
      fetchApiKeys();
    }
  };

  const getStatusBadgeColor = (status: ApiKey['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'expired':
        return 'bg-yellow-500';
      case 'revoked':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">API Keys</h1>
        <Button onClick={handleCreate}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create API Key
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              {isAdmin && <TableHead>User</TableHead>}
              <TableHead>Status</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys.map((key) => (
              <TableRow key={key.id}>
                <TableCell>{key.key_name}</TableCell>
                {isAdmin && (
                  <TableCell>
                    {key.user_username}
                    <br />
                    <span className="text-sm text-gray-500">{key.user_email}</span>
                  </TableCell>
                )}
                <TableCell>
                  <Badge className={getStatusBadgeColor(key.status)}>
                    {key.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {key.expires_at
                    ? format(new Date(key.expires_at), 'MMM d, yyyy')
                    : 'Never'}
                </TableCell>
                <TableCell>
                  {key.last_used_at
                    ? format(new Date(key.last_used_at), 'MMM d, yyyy HH:mm')
                    : 'Never'}
                </TableCell>
                <TableCell>
                  {format(new Date(key.created_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {key.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevoke(key.id)}
                      >
                        Revoke
                      </Button>
                    )}
                    {isAdmin && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(key.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {apiKeys.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 7 : 6}
                  className="text-center py-4"
                >
                  No API keys found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ApiKeyDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
      />
    </div>
  );
} 