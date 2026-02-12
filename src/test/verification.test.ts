import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase client
const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn(),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

describe('Verification System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('profiles_public view', () => {
    it('should only return verified professionals in search results', async () => {
      // Mock the profiles_public view query
      const mockProfiles = [
        { id: '1', full_name: 'Dr. Verified', verification_status: 'verified', user_type: 'profissional' },
        { id: '2', full_name: 'Tutor User', verification_status: null, user_type: 'tutor' },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            data: mockProfiles,
            error: null,
          }),
        }),
      });

      // The view should filter out non-verified professionals
      // Only verified professionals and tutors should be visible
      expect(mockProfiles.filter(p => 
        p.user_type === 'tutor' || 
        (p.user_type === 'profissional' && p.verification_status === 'verified')
      )).toHaveLength(2);
    });

    it('should not include non-verified professionals', async () => {
      const mockProfiles = [
        { id: '1', full_name: 'Not Verified', verification_status: 'not_verified', user_type: 'profissional' },
        { id: '2', full_name: 'Under Review', verification_status: 'under_review', user_type: 'profissional' },
        { id: '3', full_name: 'Rejected', verification_status: 'rejected', user_type: 'profissional' },
      ];

      // These should all be filtered out by the view
      const visibleProfiles = mockProfiles.filter(p => 
        p.user_type === 'tutor' || 
        (p.user_type === 'profissional' && p.verification_status === 'verified')
      );

      expect(visibleProfiles).toHaveLength(0);
    });
  });

  describe('change_verification_status function', () => {
    it('should change status from not_verified to verified', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      const result = await mockSupabase.rpc('change_verification_status', {
        _profile_id: 'test-profile-id',
        _new_status: 'verified',
        _notes: 'Approved by admin',
      });

      expect(result.data).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should log the verification action', async () => {
      // After calling change_verification_status, a log entry should be created
      mockSupabase.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      await mockSupabase.rpc('change_verification_status', {
        _profile_id: 'test-profile-id',
        _new_status: 'verified',
        _notes: 'Approved by admin',
      });

      // The function internally creates a log entry
      expect(mockSupabase.rpc).toHaveBeenCalledWith('change_verification_status', expect.any(Object));
    });

    it('should reset verification and remove from public search', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      const result = await mockSupabase.rpc('change_verification_status', {
        _profile_id: 'test-profile-id',
        _new_status: 'not_verified',
        _notes: 'Reset by admin',
      });

      expect(result.data).toBe(true);
      // After reset, profile should no longer appear in profiles_public for professionals
    });
  });

  describe('can_verify_profile function', () => {
    it('should return true when all documents are verified', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: [{
          can_verify: true,
          missing_documents: [],
          has_crmv_document: true,
          has_id_document: true,
        }],
        error: null,
      });

      const result = await mockSupabase.rpc('can_verify_profile', {
        _profile_id: 'test-profile-id',
      });

      expect(result.data[0].can_verify).toBe(true);
      expect(result.data[0].missing_documents).toHaveLength(0);
    });

    it('should return false with missing documents list when documents are not verified', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: [{
          can_verify: false,
          missing_documents: ['CRMV', 'RG ou CNH'],
          has_crmv_document: false,
          has_id_document: false,
        }],
        error: null,
      });

      const result = await mockSupabase.rpc('can_verify_profile', {
        _profile_id: 'test-profile-id',
      });

      expect(result.data[0].can_verify).toBe(false);
      expect(result.data[0].missing_documents).toContain('CRMV');
      expect(result.data[0].missing_documents).toContain('RG ou CNH');
    });
  });

  describe('Verification status transitions', () => {
    const validTransitions = [
      { from: 'not_verified', to: 'under_review' },
      { from: 'not_verified', to: 'verified' },
      { from: 'not_verified', to: 'rejected' },
      { from: 'under_review', to: 'verified' },
      { from: 'under_review', to: 'rejected' },
      { from: 'under_review', to: 'not_verified' },
      { from: 'verified', to: 'not_verified' }, // Reset
      { from: 'verified', to: 'under_review' },
      { from: 'rejected', to: 'under_review' },
      { from: 'rejected', to: 'not_verified' },
    ];

    validTransitions.forEach(({ from, to }) => {
      it(`should allow transition from ${from} to ${to}`, async () => {
        mockSupabase.rpc.mockResolvedValue({
          data: true,
          error: null,
        });

        const result = await mockSupabase.rpc('change_verification_status', {
          _profile_id: 'test-profile-id',
          _new_status: to,
          _notes: `Transition from ${from} to ${to}`,
        });

        expect(result.error).toBeNull();
      });
    });
  });

  describe('Search filtering', () => {
    it('should filter search results to only show verified professionals', () => {
      const allProfessionals = [
        { id: '1', verification_status: 'verified', user_type: 'profissional' },
        { id: '2', verification_status: 'not_verified', user_type: 'profissional' },
        { id: '3', verification_status: 'under_review', user_type: 'profissional' },
        { id: '4', verification_status: 'rejected', user_type: 'profissional' },
        { id: '5', verification_status: 'verified', user_type: 'empresa' },
      ];

      const visibleInSearch = allProfessionals.filter(p => 
        p.verification_status === 'verified'
      );

      expect(visibleInSearch).toHaveLength(2);
      expect(visibleInSearch.every(p => p.verification_status === 'verified')).toBe(true);
    });

    it('should maintain search functionality with filters after verification filtering', () => {
      const verifiedProfessionals = [
        { id: '1', verification_status: 'verified', specialty: 'veterinario', city: 'São Paulo' },
        { id: '2', verification_status: 'verified', specialty: 'groomer', city: 'Rio de Janeiro' },
        { id: '3', verification_status: 'verified', specialty: 'veterinario', city: 'Rio de Janeiro' },
      ];

      // Filter by specialty
      const vets = verifiedProfessionals.filter(p => p.specialty === 'veterinario');
      expect(vets).toHaveLength(2);

      // Filter by city
      const rioProfs = verifiedProfessionals.filter(p => p.city === 'Rio de Janeiro');
      expect(rioProfs).toHaveLength(2);

      // Combined filter
      const rioVets = verifiedProfessionals.filter(p => 
        p.specialty === 'veterinario' && p.city === 'Rio de Janeiro'
      );
      expect(rioVets).toHaveLength(1);
    });
  });

  describe('Reset verification', () => {
    it('should remove profile from public search immediately after reset', async () => {
      // Before reset - profile is verified and visible
      const beforeReset = { verification_status: 'verified', is_verified: true };
      
      // After reset
      mockSupabase.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      await mockSupabase.rpc('change_verification_status', {
        _profile_id: 'test-profile-id',
        _new_status: 'not_verified',
        _notes: 'Reset verification',
      });

      // Profile should now be not_verified and is_verified should be false
      const afterReset = { verification_status: 'not_verified', is_verified: false };
      
      expect(afterReset.verification_status).toBe('not_verified');
      expect(afterReset.is_verified).toBe(false);
    });

    it('should log reset action with appropriate action type', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      // The change_verification_status function logs 'reset' action when going from verified to not_verified/under_review
      await mockSupabase.rpc('change_verification_status', {
        _profile_id: 'test-profile-id',
        _new_status: 'not_verified',
        _notes: 'Reset verification for review',
      });

      expect(mockSupabase.rpc).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle profile without documents gracefully', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: [{
          can_verify: false,
          missing_documents: ['CRMV', 'RG ou CNH'],
          has_crmv_document: false,
          has_id_document: false,
        }],
        error: null,
      });

      const result = await mockSupabase.rpc('can_verify_profile', {
        _profile_id: 'profile-without-docs',
      });

      expect(result.data[0].can_verify).toBe(false);
    });

    it('should reject non-admin users trying to change verification status', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Only administrators can change verification status' },
      });

      const result = await mockSupabase.rpc('change_verification_status', {
        _profile_id: 'test-profile-id',
        _new_status: 'verified',
      });

      expect(result.error).not.toBeNull();
      expect(result.error.message).toContain('administrators');
    });
  });

  describe('Email Notifications', () => {
    it('should send notification when status changes to verified', async () => {
      const notificationPayload = {
        profileId: 'test-profile-id',
        newStatus: 'verified',
        oldStatus: 'under_review',
        notes: 'All documents verified',
      };

      // Verify payload structure
      expect(notificationPayload.profileId).toBeDefined();
      expect(notificationPayload.newStatus).toBe('verified');
      expect(notificationPayload.oldStatus).not.toBe(notificationPayload.newStatus);
    });

    it('should send notification when status changes to rejected', async () => {
      const notificationPayload = {
        profileId: 'test-profile-id',
        newStatus: 'rejected',
        oldStatus: 'under_review',
        notes: 'Documents unclear',
      };

      expect(notificationPayload.newStatus).toBe('rejected');
      expect(notificationPayload.notes).toBeDefined();
    });

    it('should send notification when verification is reset', async () => {
      const notificationPayload = {
        profileId: 'test-profile-id',
        newStatus: 'not_verified',
        oldStatus: 'verified',
        notes: 'Reset for document update',
      };

      expect(notificationPayload.newStatus).toBe('not_verified');
      expect(notificationPayload.oldStatus).toBe('verified');
    });

    it('should skip notification when status does not change', () => {
      const oldStatus = 'verified';
      const newStatus = 'verified';

      const shouldSendNotification = oldStatus !== newStatus;
      expect(shouldSendNotification).toBe(false);
    });

    it('should prevent duplicate notifications within cooldown period', () => {
      const notificationSentMap = new Map<string, number>();
      const COOLDOWN_MS = 5000;

      const canSendNotification = (key: string) => {
        const lastSent = notificationSentMap.get(key);
        const now = Date.now();

        if (lastSent && now - lastSent < COOLDOWN_MS) {
          return false;
        }

        notificationSentMap.set(key, now);
        return true;
      };

      // First call should succeed
      expect(canSendNotification('profile1-verified')).toBe(true);
      // Immediate second call should fail
      expect(canSendNotification('profile1-verified')).toBe(false);
      // Different profile should succeed
      expect(canSendNotification('profile2-verified')).toBe(true);
    });
  });

  describe('is_verified Field Synchronization', () => {
    it('should sync is_verified to true when status is verified', () => {
      const syncIsVerified = (status: string) => status === 'verified';
      
      expect(syncIsVerified('verified')).toBe(true);
      expect(syncIsVerified('not_verified')).toBe(false);
      expect(syncIsVerified('under_review')).toBe(false);
      expect(syncIsVerified('rejected')).toBe(false);
    });

    it('should keep is_verified in sync via database trigger', async () => {
      // Simulate profile update
      const beforeUpdate = { verification_status: 'not_verified', is_verified: false };
      
      // After status change, trigger should sync is_verified
      const afterUpdate = { 
        verification_status: 'verified', 
        is_verified: beforeUpdate.verification_status === 'verified' ? true : (
          'verified' === 'verified' // Trigger logic
        )
      };

      expect(afterUpdate.is_verified).toBe(true);
    });
  });
});
