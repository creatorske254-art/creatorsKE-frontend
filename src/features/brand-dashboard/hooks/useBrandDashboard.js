import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { brandService } from '../services/brand.service';

const CAMPAIGNS_KEY = ['brand-campaigns'];
const SHORTLIST_KEY = ['brand-shortlist'];
const PROFILE_KEY = ['brand-profile'];

export function useBrandDashboard() {
  const queryClient = useQueryClient();

  const campaignsQuery = useQuery({
    queryKey: CAMPAIGNS_KEY,
    queryFn: () => brandService.listCampaigns(),
  });

  const shortlistQuery = useQuery({
    queryKey: SHORTLIST_KEY,
    queryFn: () => brandService.getShortlist(),
  });

  const profileQuery = useQuery({
    queryKey: PROFILE_KEY,
    queryFn: () => brandService.getProfile(),
  });

  const campaigns = campaignsQuery.data?.campaigns ?? campaignsQuery.data ?? [];
  const shortlist = shortlistQuery.data?.shortlist ?? shortlistQuery.data ?? [];
  const activeCampaignCount = campaigns.filter(
    (c) => c.status === 'in_progress' || c.status === 'active'
  ).length;

  const addToShortlistMutation = useMutation({
    mutationFn: (creatorId) => brandService.addToShortlist(creatorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHORTLIST_KEY });
      toast.success('Added to shortlist.');
    },
    onError: () => toast.error('Could not add to shortlist.'),
  });

  const removeFromShortlistMutation = useMutation({
    mutationFn: (id) => brandService.removeFromShortlist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHORTLIST_KEY });
      toast.success('Removed from shortlist.');
    },
    onError: () => toast.error('Could not remove from shortlist.'),
  });

  const createCampaignMutation = useMutation({
    mutationFn: (data) => brandService.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_KEY });
      toast.success('Campaign created.');
    },
    onError: () => toast.error('Could not create campaign.'),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => brandService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
      toast.success('Profile updated.');
    },
    onError: () => toast.error('Could not update profile.'),
  });

  return {
    campaigns,
    isLoadingCampaigns: campaignsQuery.isLoading,
    activeCampaignCount,
    shortlist,
    isLoadingShortlist: shortlistQuery.isLoading,
    profile: profileQuery.data,
    isLoadingProfile: profileQuery.isLoading,
    addToShortlist: addToShortlistMutation.mutate,
    removeFromShortlist: removeFromShortlistMutation.mutate,
    createCampaign: createCampaignMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
  };
}

export function useCampaign(id) {
  return useQuery({
    queryKey: ['brand-campaign', id],
    queryFn: () => brandService.getCampaign(id),
    enabled: !!id,
  });
}
