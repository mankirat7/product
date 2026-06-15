import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { colors } from '../constants/theme';

export default function SocialScreen() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [myUsername, setMyUsername] = useState('');
  const [addedFriends, setAddedFriends] = useState({});

  useEffect(() => {
    loadLeaderboard();
    loadMyProfile();
  }, []);

  const loadMyProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', session.user.id)
      .single();
    if (data) setMyUsername(data.username);
  };

  const loadLeaderboard = async () => {
    setLoadingLeaderboard(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .rpc('get_leaderboard', { requesting_user_id: session.user.id });

    if (!error && data) setLeaderboard(data);
    setLoadingLeaderboard(false);
  };

  const searchUser = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchError('');
    setSearchResult(null);

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', searchQuery.toLowerCase().trim())
      .single();

    if (error || !data) {
      setSearchError('user not found');
    } else if (data.username === myUsername) {
      setSearchError("that's you!");
    } else {
      setSearchResult(data);
    }

    setSearchLoading(false);
  };

  const addFriend = async (friendId) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from('friendships')
      .insert({ user_id: session.user.id, friend_id: friendId });

    if (!error) {
      setAddedFriends(prev => ({ ...prev, [friendId]: true }));
      setSearchResult(null);
      setSearchQuery('');
      loadLeaderboard();
    }
  };

  const getMedalColor = (rank) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return colors.textTertiary;
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>friends</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>add a friend</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="search by username"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={searchUser}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={searchUser}>
            {searchLoading
              ? <ActivityIndicator color="#000" size="small" />
              : <Ionicons name="search" size={18} color="#000" />
            }
          </TouchableOpacity>
        </View>

        {searchError !== '' && (
          <Text style={styles.searchError}>{searchError}</Text>
        )}

        {searchResult && (
          <View style={styles.searchResultCard}>
            <View style={styles.searchResultLeft}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {searchResult.username[0].toUpperCase()}
                </Text>
              </View>
              <Text style={styles.searchResultUsername}>@{searchResult.username}</Text>
            </View>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => addFriend(searchResult.id)}
            >
              <Text style={styles.addBtnText}>add</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>this week's leaderboard</Text>

        {loadingLeaderboard ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 20 }} />
        ) : leaderboard.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="people-outline" size={32} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>no friends yet</Text>
            <Text style={styles.emptySub}>search for friends by username to see the leaderboard</Text>
          </View>
        ) : (
          <View style={styles.leaderboardCard}>
            {leaderboard.map((entry, i) => (
              <View key={entry.username}>
                <View style={styles.leaderboardRow}>
                  <Text style={[styles.rank, { color: getMedalColor(entry.rank) }]}>
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                  </Text>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {entry.username[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.leaderboardInfo}>
                    <Text style={[
                      styles.leaderboardUsername,
                      entry.username === myUsername && styles.leaderboardUsernameMine
                    ]}>
                      {entry.username === myUsername ? 'you' : `@${entry.username}`}
                    </Text>
                    <Text style={styles.leaderboardSteps}>
                      {Number(entry.steps).toLocaleString()} steps this week
                    </Text>
                  </View>
                  {entry.username === myUsername && (
                    <View style={styles.youBadge}>
                      <Text style={styles.youBadgeText}>you</Text>
                    </View>
                  )}
                </View>
                {i < leaderboard.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 64,
    gap: 24,
  },
  heading: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.textSecondary,
    fontWeight: '500',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: colors.textPrimary,
  },
  searchBtn: {
    width: 48,
    height: 48,
    backgroundColor: colors.accent,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchError: {
    fontSize: 13,
    color: colors.accent,
    letterSpacing: 0.2,
  },
  searchResultCard: {
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchResultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentBg,
    borderWidth: 0.5,
    borderColor: colors.accentBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  searchResultUsername: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  addBtn: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addBtnText: {
    fontSize: 13,
    color: '#000',
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  leaderboardCard: {
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: 'hidden',
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  rank: {
    fontSize: 16,
    fontWeight: '600',
    width: 32,
    textAlign: 'center',
  },
  leaderboardInfo: {
    flex: 1,
    gap: 2,
  },
  leaderboardUsername: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  leaderboardUsernameMine: {
    color: colors.accent,
  },
  leaderboardSteps: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  youBadge: {
    backgroundColor: colors.accentBg,
    borderWidth: 0.5,
    borderColor: colors.accentBorder,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  youBadgeText: {
    fontSize: 10,
    color: colors.accent,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
});