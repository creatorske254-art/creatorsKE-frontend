import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { brandService } from '../services/brand.service';
import { useAuth } from '@/context/AuthContext';

/**
 * Brand campaigns and shortlist (useBrandDashboard), one campaign (useCampaign) and its
 * approve / dispute actions (useCampaignActions).
 */
const CAMPAIGNS_KEY = ['brand-campaigns'];
const SHORTLIST_KEY = ['brand-shortlist'];
const PROFILE_KEY = ['brand-profile'];

export function useBrandDashboard() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();

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
    onError: (err) => toast.error(err?.message || 'Could not add to shortlist.'),
  });

  const removeFromShortlistMutation = useMutation({
    mutationFn: (id) => brandService.removeFromShortlist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHORTLIST_KEY });
      toast.success('Removed from shortlist.');
    },
    onError: (err) => toast.error(err?.message || 'Could not remove from shortlist.'),
  });

  const createCampaignMutation = useMutation({
    mutationFn: (data) => brandService.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_KEY });
      toast.success('Campaign created.');
    },
    onError: (err) => toast.error(err?.message || 'Could not create campaign.'),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => brandService.updateProfile(data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
      if (updated?.companyName || updated?.logoUrl !== undefined) updateUser?.({ companyName: updated.companyName, logoUrl: updated.logoUrl ?? null });
      toast.success('Profile updated.');
    },
    onError: (err) => toast.error(err?.message || 'Could not update profile.'),
  });

  return {
    campaigns,
    isLoadingCampaigns: campaignsQuery.isLoading,
    isCampaignsError: campaignsQuery.isError,
    refetchCampaigns: campaignsQuery.refetch,
    activeCampaignCount,
    shortlist,
    isLoadingShortlist: shortlistQuery.isLoading,
    isShortlistError: shortlistQuery.isError,
    profile: profileQuery.data,
    isLoadingProfile: profileQuery.isLoading,
    isProfileError: profileQuery.isError,
    refetchProfile: profileQuery.refetch,
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

// Approve (POST /brands/campaigns/:id/approve, releases escrow) and dispute
// (POST /brands/campaigns/:id/dispute { evidence }) for one booking.
export function useCampaignActions(id) {
  const queryClient = useQueryClient();
  const CAMPAIGN_KEY = ['brand-campaign', id];

  const approveMutation = useMutation({
    mutationFn: () => brandService.approveCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAMPAIGN_KEY });
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_KEY });
      toast.success('Delivery approved, payment released.');
    },
    onError: (err) => toast.error(err?.message || 'Could not approve delivery. Please try again.'),
  });

  const disputeMutation = useMutation({
    mutationFn: (evidence) => brandService.disputeCampaign(id, evidence),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAMPAIGN_KEY });
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_KEY });
      toast.success('Dispute submitted.');
    },
    onError: (err) => toast.error(err?.message || 'Could not submit dispute. Please try again.'),
  });

  return {
    approve: approveMutation.mutate,
    isApproving: approveMutation.isPending,
    dispute: disputeMutation.mutate,
    isDisputing: disputeMutation.isPending,
  };
}
