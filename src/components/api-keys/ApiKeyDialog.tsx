'use client';

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { apiKeysService } from '@/services/apiKeys';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ClipboardIcon } from '@heroicons/react/24/outline';

const formSchema = z.object({
  key_name: z.string().min(1, 'Name is required'),
  expires_at: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ApiKeyDialogProps {
  open: boolean;
  onClose: (success?: boolean) => void;
}

export function ApiKeyDialog({ open, onClose }: ApiKeyDialogProps) {
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const { toast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      key_name: '',
      expires_at: '',
    },
  });

  const handleCopyApiKey = () => {
    if (newApiKey) {
      navigator.clipboard.writeText(newApiKey);
      toast({
        title: 'Success',
        description: 'API key copied to clipboard',
      });
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const result = await apiKeysService.create({
        key_name: data.key_name,
        expires_at: data.expires_at || undefined,
      });

      if (result.api_key) {
        setNewApiKey(result.api_key);
        form.reset();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create API key',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    form.reset();
    setNewApiKey(null);
    onClose(true);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
        </DialogHeader>

        {newApiKey ? (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                This is your API key. Make sure to copy it now as you won't be able
                to see it again.
              </AlertDescription>
            </Alert>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-gray-100 rounded font-mono text-sm break-all">
                {newApiKey}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyApiKey}
                title="Copy to clipboard"
              >
                <ClipboardIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleClose}>Done</Button>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="key_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter a name for this API key"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expires_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expires At (Optional)</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => onClose()}
                >
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
} 