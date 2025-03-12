'use client';

import { useEffect, useState } from 'react';
import { UserBroker, userBrokersService } from '@/services/userBrokers';
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
import { UserBrokerDialog } from '@/components/user-brokers/UserBrokerDialog';

export default function UserBrokersPage() {
  const [userBrokers, setUserBrokers] = useState<UserBroker[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<UserBroker | null>(null);
  const { toast } = useToast();

  const fetchUserBrokers = async () => {
    try {
      const data = await userBrokersService.getAll();
      setUserBrokers(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch broker configurations',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchUserBrokers();
  }, []);

  const handleCreate = () => {
    setSelectedBroker(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (broker: UserBroker) => {
    setSelectedBroker(broker);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this broker configuration?')) {
      return;
    }

    try {
      await userBrokersService.delete(id);
      toast({
        title: 'Success',
        description: 'Broker configuration deleted successfully',
      });
      fetchUserBrokers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete broker configuration',
        variant: 'destructive',
      });
    }
  };

  const handleDialogClose = (success?: boolean) => {
    setIsDialogOpen(false);
    if (success) {
      fetchUserBrokers();
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Broker Configurations</h1>
        <Button onClick={handleCreate}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Broker
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Broker</TableHead>
              <TableHead>API Key</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userBrokers.map((broker) => (
              <TableRow key={broker.id}>
                <TableCell>{broker.broker_name}</TableCell>
                <TableCell>
                  <span className="font-mono">
                    {broker.api_key.substring(0, 8)}...
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(broker.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(broker)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(broker.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {userBrokers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No broker configurations found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <UserBrokerDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        broker={selectedBroker}
      />
    </div>
  );
} 