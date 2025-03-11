import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { UserBroker, userBrokersService } from '@/services/userBrokers';
import { brokersService } from '@/services/brokers';

interface Broker {
  id: string;
  name: string;
}

const formSchema = z.object({
  broker_id: z.string().min(1, 'Please select a broker'),
  api_key: z.string().min(1, 'API key is required'),
});

type FormData = z.infer<typeof formSchema>;

interface UserBrokerDialogProps {
  open: boolean;
  onClose: (success?: boolean) => void;
  broker?: UserBroker | null;
}

export function UserBrokerDialog({
  open,
  onClose,
  broker,
}: UserBrokerDialogProps) {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const { toast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      broker_id: '',
      api_key: '',
    },
  });

  useEffect(() => {
    const fetchBrokers = async () => {
      try {
        const data = await brokersService.getAll();
        setBrokers(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch brokers',
          variant: 'destructive',
        });
      }
    };

    if (open) {
      fetchBrokers();
      if (broker) {
        form.reset({
          broker_id: broker.broker_id,
          api_key: broker.api_key,
        });
      } else {
        form.reset();
      }
    }
  }, [open, broker, form]);

  const onSubmit = async (data: FormData) => {
    try {
      if (broker) {
        await userBrokersService.update(broker.id, {
          api_key: data.api_key,
        });
        toast({
          title: 'Success',
          description: 'Broker configuration updated successfully',
        });
      } else {
        await userBrokersService.create(data);
        toast({
          title: 'Success',
          description: 'Broker configuration created successfully',
        });
      }
      onClose(true);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {broker ? 'Edit Broker Configuration' : 'Add Broker Configuration'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="broker_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Broker</FormLabel>
                  <Select
                    disabled={!!broker}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a broker" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {brokers.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="api_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => onClose()}>
                Cancel
              </Button>
              <Button type="submit">
                {broker ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 