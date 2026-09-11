import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { enquiryService } from '../services/enquiry.service';
import { STATUS } from '../constants/enquiry';

const ENQUIRIES_KEY = ['enquiries'];

export function useEnquiries() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ENQUIRIES_KEY,
    queryFn: () => enquiryService.listEnquiries(),
  });

  const enquiries = query.data?.enquiries ?? query.data ?? [];

  const pipelineCounts = {
    new: enquiries.filter((e) => e.status === STATUS.NEW).length,
    in_review: enquiries.filter((e) => e.status === STATUS.IN_REVIEW).length,
    booked: enquiries.filter((e) => e.status === STATUS.BOOKED).length,
    completed: enquiries.filter((e) => e.status === STATUS.COMPLETED).length,
  };

  const acceptMutation = useMutation({
    mutationFn: (id) => enquiryService.acceptEnquiry(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ENQUIRIES_KEY });
      queryClient.invalidateQueries({ queryKey: ['enquiry', id] });
      toast.success('Enquiry accepted.');
    },
    onError: () => toast.error('Could not accept enquiry.'),
  });

  const declineMutation = useMutation({
    mutationFn: (id) => enquiryService.declineEnquiry(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ENQUIRIES_KEY });
      queryClient.invalidateQueries({ queryKey: ['enquiry', id] });
      toast.success('Enquiry declined.');
    },
    onError: () => toast.error('Could not decline enquiry.'),
  });

  return {
    enquiries,
    pipelineCounts,
    isLoading: query.isLoading,
    error: query.error,
    accept: acceptMutation.mutate,
    decline: declineMutation.mutate,
  };
}

export function useEnquiry(id) {
  return useQuery({
    queryKey: ['enquiry', id],
    queryFn: () => enquiryService.getEnquiry(id),
    enabled: !!id,
  });
}

// Standalone from useEnquiries() on purpose: that hook eagerly fetches the
// private, role-scoped enquiry list, which the *public* rate card page
// (where the enquiry form lives) shouldn't trigger just to get at this
// mutation.
export function useCreateEnquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => enquiryService.createEnquiry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENQUIRIES_KEY });
      toast.success('Enquiry sent!');
    },
    onError: () => toast.error('Could not send enquiry. Please try again.'),
  });
}
