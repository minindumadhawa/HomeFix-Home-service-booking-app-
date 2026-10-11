import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { getAllProviders } from '../services/providerService';
import { ServiceProvider } from '../types/provider';
import { Booking, BookingStatus } from '../types/booking';
import { getAllTickets, updateTicket as updateSupportTicket, deleteTicket as deleteSupportTicket } from '../services/ticketService';
import { SupportTicket, TicketStatus } from '../types/ticket';

interface UserRecord {
  id: string;
  name?: string;
  displayName?: string;
  email?: string;
  phone?: string;
  role: 'customer' | 'provider' | 'admin';
  createdAt?: string;
}

export default function AdminDashboardScreen() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'providers' | 'bookings' | 'tickets'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Data states
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'provider' | 'admin'>('all');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'all' | TicketStatus>('all');

  // Edit / Role Change Modal
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);

  // Ticket Response Modal
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isTicketModalVisible, setIsTicketModalVisible] = useState(false);
  const [adminResponseText, setAdminResponseText] = useState('');
  const [submittingTicketUpdate, setSubmittingTicketUpdate] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch all users from Firestore
      const usersSnap = await getDocs(collection(db, 'users'));
      const fetchedUsers: UserRecord[] = [];
      usersSnap.forEach((d) => {
        const data = d.data();
        fetchedUsers.push({
          id: d.id,
          name: data.name || data.displayName || 'Unnamed User',
          email: data.email || '',
          phone: data.phone || '',
          role: data.role || 'customer',
          createdAt: data.createdAt || '',
        });
      });
      setUsers(fetchedUsers);

      // 2. Fetch all providers
      const fetchedProviders = await getAllProviders();
      setProviders(fetchedProviders);

      // 3. Fetch all bookings
      const bookingsSnap = await getDocs(collection(db, 'bookings'));
      const fetchedBookings: Booking[] = [];
      bookingsSnap.forEach((d) => {
        fetchedBookings.push(d.data() as Booking);
      });
      setBookings(fetchedBookings);

      // 4. Fetch all support tickets
      const fetchedTickets = await getAllTickets();
      setTickets(fetchedTickets);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      await updateSupportTicket(ticketId, { status: newStatus });
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t))
      );
      Alert.alert('Ticket Updated', `Ticket status changed to ${newStatus}.`);
    } catch (err) {
      console.error('Failed to update ticket status:', err);
      Alert.alert('Error', 'Could not update ticket status.');
    }
  };

  const handleSaveAdminResponse = async () => {
    if (!selectedTicket) return;
    if (!adminResponseText.trim()) {
      Alert.alert('Validation Error', 'Please enter a response message.');
      return;
    }

    setSubmittingTicketUpdate(true);
    try {
      const updatedStatus: TicketStatus = selectedTicket.status === 'Open' ? 'In Progress' : selectedTicket.status;
      await updateSupportTicket(selectedTicket.id, {
        adminResponse: adminResponseText.trim(),
        status: updatedStatus,
      });

      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicket.id
            ? {
                ...t,
                adminResponse: adminResponseText.trim(),
                status: updatedStatus,
                updatedAt: new Date().toISOString(),
              }
            : t
        )
      );

      Alert.alert('Response Saved', 'Customer will now see your response on their Support page.');
      setIsTicketModalVisible(false);
      setSelectedTicket(null);
      setAdminResponseText('');
    } catch (err) {
      console.error('Failed to save ticket response:', err);
      Alert.alert('Error', 'Could not submit response. Please try again.');
    } finally {
      setSubmittingTicketUpdate(false);
    }
  };

  const handleDeleteTicket = (ticket: SupportTicket) => {
    Alert.alert(
      'Delete Support Ticket',
      `Are you sure you want to delete ticket #${ticket.id.slice(0, 6)}: "${ticket.subject}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSupportTicket(ticket.id);
              setTickets((prev) => prev.filter((t) => t.id !== ticket.id));
              Alert.alert('Deleted', 'Support ticket has been removed.');
            } catch (err) {
              console.error('Failed to delete ticket:', err);
              Alert.alert('Error', 'Could not delete ticket.');
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('SignOut error:', err);
    }
    // Navigate straight to login page
    router.replace('/(auth)/login');
  };

  const handleChangeUserRole = async (newRole: 'customer' | 'provider' | 'admin') => {
    if (!selectedUser) return;
    setUpdatingRole(true);
    try {
      await updateDoc(doc(db, 'users', selectedUser.id), { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, role: newRole } : u))
      );
      Alert.alert('Role Updated', `${selectedUser.name || 'User'} is now a ${newRole.toUpperCase()}.`);
      setIsRoleModalVisible(false);
    } catch (error) {
      console.error('Role update failed:', error);
      Alert.alert('Update Failed', 'Could not update user role. Try again.');
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleDeleteUser = (user: UserRecord) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete user ${user.name || user.email || user.id}? This action is irreversible.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'users', user.id));
              setUsers((prev) => prev.filter((u) => u.id !== user.id));
              Alert.alert('Deleted', 'User record has been removed.');
            } catch (err) {
              console.error('Failed to delete user:', err);
              Alert.alert('Error', 'Could not delete user.');
            }
          },
        },
      ]
    );
  };

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
      Alert.alert('Status Updated', `Booking ${bookingId} marked as ${newStatus}.`);
    } catch (err) {
      console.error('Failed to update booking status:', err);
      Alert.alert('Error', 'Could not update booking status.');
    }
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone || '').includes(searchQuery);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Filtered Tickets
  const filteredTickets = tickets.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (t.subject || '').toLowerCase().includes(q) ||
      (t.userName || '').toLowerCase().includes(q) ||
      (t.userEmail || '').toLowerCase().includes(q) ||
      (t.topic || '').toLowerCase().includes(q) ||
      (t.id || '').toLowerCase().includes(q);
    const matchesStatus = ticketStatusFilter === 'all' || t.status === ticketStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate high-level stats
  const totalUsers = users.length;
  const totalCustomers = users.filter((u) => u.role === 'customer').length;
  const totalProviders = users.filter((u) => u.role === 'provider').length;
  const totalAdmins = users.filter((u) => u.role === 'admin').length;
  const totalBookingsCount = bookings.length;
  const upcomingBookings = bookings.filter((b) => b.status === 'Upcoming').length;
  const completedBookings = bookings.filter((b) => b.status === 'Completed').length;
  const totalTicketsCount = tickets.length;
  const openTicketsCount = tickets.filter((t) => t.status === 'Open' || t.status === 'In Progress').length;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Admin Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.adminShieldBadge}>
            <Ionicons name="shield-checkmark" size={20} color="#FFF" />
          </View>
          <View>
            <View style={styles.adminTitleRow}>
              <Text style={styles.headerTitle}>HomeFix Admin Panel</Text>
            </View>
            <Text style={styles.headerSubtitle}>System Controls & Master Database</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={16} color="#FFF" style={{ marginRight: 4 }} />
          <Text style={styles.logoutBtnText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* Admin Tab Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'overview' && styles.tabItemActive]}
          onPress={() => setActiveTab('overview')}
        >
          <Ionicons
            name="speedometer-outline"
            size={18}
            color={activeTab === 'overview' ? '#EF4444' : '#9CA3AF'}
          />
          <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
            Overview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'users' && styles.tabItemActive]}
          onPress={() => setActiveTab('users')}
        >
          <Ionicons
            name="people-outline"
            size={18}
            color={activeTab === 'users' ? '#EF4444' : '#9CA3AF'}
          />
          <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>
            Users ({users.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'providers' && styles.tabItemActive]}
          onPress={() => setActiveTab('providers')}
        >
          <Ionicons
            name="construct-outline"
            size={18}
            color={activeTab === 'providers' ? '#EF4444' : '#9CA3AF'}
          />
          <Text style={[styles.tabText, activeTab === 'providers' && styles.tabTextActive]}>
            Pros ({providers.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'bookings' && styles.tabItemActive]}
          onPress={() => setActiveTab('bookings')}
        >
          <Ionicons
            name="calendar-outline"
            size={18}
            color={activeTab === 'bookings' ? '#EF4444' : '#9CA3AF'}
          />
          <Text style={[styles.tabText, activeTab === 'bookings' && styles.tabTextActive]}>
            Bookings ({bookings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'tickets' && styles.tabItemActive]}
          onPress={() => setActiveTab('tickets')}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={18}
            color={activeTab === 'tickets' ? '#EF4444' : '#9CA3AF'}
          />
          <Text style={[styles.tabText, activeTab === 'tickets' && styles.tabTextActive]}>
            Tickets ({tickets.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EF4444" />
          <Text style={styles.loadingText}>Loading System Records...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={['#EF4444']} />
          }
        >
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <View style={styles.tabContent}>
              <Text style={styles.sectionHeader}>PLATFORM METRICS</Text>
              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <View style={[styles.metricIconBox, { backgroundColor: '#EEF2FF' }]}>
                    <Ionicons name="people" size={20} color="#4F46E5" />
                  </View>
                  <Text style={styles.metricValue}>{totalUsers}</Text>
                  <Text style={styles.metricLabel}>Total Users</Text>
                </View>

                <View style={styles.metricCard}>
                  <View style={[styles.metricIconBox, { backgroundColor: '#ECFDF5' }]}>
                    <Ionicons name="construct" size={20} color="#10B981" />
                  </View>
                  <Text style={styles.metricValue}>{totalProviders}</Text>
                  <Text style={styles.metricLabel}>Active Pros</Text>
                </View>

                <View style={styles.metricCard}>
                  <View style={[styles.metricIconBox, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name="time" size={20} color="#D97706" />
                  </View>
                  <Text style={styles.metricValue}>{upcomingBookings}</Text>
                  <Text style={styles.metricLabel}>Upcoming</Text>
                </View>

                <View style={styles.metricCard}>
                  <View style={[styles.metricIconBox, { backgroundColor: '#FEF2F2' }]}>
                    <Ionicons name="shield-checkmark" size={20} color="#DC2626" />
                  </View>
                  <Text style={styles.metricValue}>{totalAdmins}</Text>
                  <Text style={styles.metricLabel}>System Admins</Text>
                </View>

                <View style={styles.metricCard}>
                  <View style={[styles.metricIconBox, { backgroundColor: '#F5F3FF' }]}>
                    <Ionicons name="chatbubbles" size={20} color="#7C3AED" />
                  </View>
                  <Text style={styles.metricValue}>{openTicketsCount}</Text>
                  <Text style={styles.metricLabel}>Open Tickets</Text>
                </View>
              </View>

              {/* Quick Actions */}
              <Text style={styles.sectionHeader}>ADMIN QUICK ACTIONS</Text>
              <View style={styles.quickActionsCard}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => setActiveTab('tickets')}
                >
                  <View style={[styles.actionIcon, { backgroundColor: '#F5F3FF' }]}>
                    <Ionicons name="chatbubble-ellipses" size={22} color="#7C3AED" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.actionTitle}>Review Support Tickets ({openTicketsCount} pending)</Text>
                    <Text style={styles.actionSub}>Read user issues, reply & change ticket status</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                <View style={styles.actionDivider} />

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => router.push('/manage-services')}
                >
                  <View style={[styles.actionIcon, { backgroundColor: '#ECFDF5' }]}>
                    <Ionicons name="add-circle" size={22} color="#10B981" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.actionTitle}>Register New Service Profile</Text>
                    <Text style={styles.actionSub}>Add specialist profiles directly to catalog</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                <View style={styles.actionDivider} />

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => setActiveTab('users')}
                >
                  <View style={[styles.actionIcon, { backgroundColor: '#FEF2F2' }]}>
                    <Ionicons name="person-add" size={22} color="#DC2626" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.actionTitle}>Manage Permissions & Roles</Text>
                    <Text style={styles.actionSub}>Promote accounts to Provider or Admin</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* Recent Bookings Snapshot */}
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionHeader}>RECENT BOOKINGS SNAPSHOT</Text>
                <TouchableOpacity onPress={() => setActiveTab('bookings')}>
                  <Text style={styles.seeAllText}>View All ({bookings.length})</Text>
                </TouchableOpacity>
              </View>

              {bookings.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="receipt-outline" size={32} color="#9CA3AF" />
                  <Text style={styles.emptyText}>No bookings placed yet.</Text>
                </View>
              ) : (
                bookings.slice(0, 3).map((b) => (
                  <View key={b.id} style={styles.bookingCard}>
                    <View style={styles.bookingCardHeader}>
                      <Text style={styles.bookingIdText}>{b.id}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          b.status === 'Completed'
                            ? styles.statusCompleted
                            : b.status === 'Cancelled'
                            ? styles.statusCancelled
                            : styles.statusUpcoming,
                        ]}
                      >
                        <Text style={styles.statusBadgeText}>{b.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.bookingServiceTitle}>{b.serviceTitle}</Text>
                    <Text style={styles.bookingProText}>Provider: {b.providerName}</Text>
                    <View style={styles.bookingMetaRow}>
                      <Text style={styles.bookingMetaText}>
                        <Ionicons name="calendar-outline" size={13} color="#6B7280" /> {b.selectedDate} at {b.selectedTime}
                      </Text>
                      <Text style={styles.bookingPrice}>LKR {b.totalAmount}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {/* TAB 2: USERS MANAGEMENT */}
          {activeTab === 'users' && (
            <View style={styles.tabContent}>
              {/* Search Bar */}
              <View style={styles.searchRow}>
                <Ionicons name="search" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Search user by name, email, phone..."
                  placeholderTextColor="#9CA3AF"
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery !== '' && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Role Filter Pills */}
              <View style={styles.roleFilterRow}>
                {(['all', 'customer', 'provider', 'admin'] as const).map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.roleFilterPill, roleFilter === r && styles.roleFilterPillActive]}
                    onPress={() => setRoleFilter(r)}
                  >
                    <Text
                      style={[
                        styles.roleFilterText,
                        roleFilter === r && styles.roleFilterTextActive,
                      ]}
                    >
                      {r.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* User List */}
              {filteredUsers.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="people-outline" size={32} color="#9CA3AF" />
                  <Text style={styles.emptyText}>No users match the criteria.</Text>
                </View>
              ) : (
                filteredUsers.map((u) => (
                  <View key={u.id} style={styles.userCard}>
                    <View style={styles.userCardHeader}>
                      <View
                        style={[
                          styles.userAvatar,
                          u.role === 'admin'
                            ? { backgroundColor: '#DC2626' }
                            : u.role === 'provider'
                            ? { backgroundColor: '#10B981' }
                            : { backgroundColor: '#3B82F6' },
                        ]}
                      >
                        <Text style={styles.userAvatarText}>
                          {(u.name || u.email || 'U').substring(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.userNameText}>{u.name || 'Unnamed Account'}</Text>
                        <Text style={styles.userEmailText}>{u.email || u.phone || 'No direct contact'}</Text>
                        <View style={styles.roleBadgeContainer}>
                          <View
                            style={[
                              styles.userRoleBadge,
                              u.role === 'admin'
                                ? styles.roleBadgeAdmin
                                : u.role === 'provider'
                                ? styles.roleBadgeProvider
                                : styles.roleBadgeCustomer,
                            ]}
                          >
                            <Text
                              style={[
                                styles.userRoleBadgeText,
                                u.role === 'admin'
                                  ? { color: '#DC2626' }
                                  : u.role === 'provider'
                                  ? { color: '#059669' }
                                  : { color: '#2563EB' },
                              ]}
                            >
                              {u.role.toUpperCase()}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Action buttons */}
                    <View style={styles.userActionsRow}>
                      <TouchableOpacity
                        style={styles.changeRoleBtn}
                        onPress={() => {
                          setSelectedUser(u);
                          setIsRoleModalVisible(true);
                        }}
                      >
                        <Ionicons name="swap-horizontal" size={15} color="#4B5563" style={{ marginRight: 4 }} />
                        <Text style={styles.changeRoleBtnText}>Change Role</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteUserBtn}
                        onPress={() => handleDeleteUser(u)}
                      >
                        <Ionicons name="trash-outline" size={15} color="#DC2626" style={{ marginRight: 4 }} />
                        <Text style={styles.deleteUserBtnText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {/* TAB 3: PROVIDERS CATALOG */}
          {activeTab === 'providers' && (
            <View style={styles.tabContent}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionHeader}>SERVICE PROVIDERS ({providers.length})</Text>
                <TouchableOpacity
                  style={styles.addNewProBtn}
                  onPress={() => router.push('/manage-services')}
                >
                  <Ionicons name="add" size={16} color="#FFF" style={{ marginRight: 4 }} />
                  <Text style={styles.addNewProText}>Add Provider</Text>
                </TouchableOpacity>
              </View>

              {providers.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="construct-outline" size={32} color="#9CA3AF" />
                  <Text style={styles.emptyText}>No registered service providers found.</Text>
                </View>
              ) : (
                providers.map((p) => (
                  <View key={p.id} style={styles.proAdminCard}>
                    <View style={styles.proAdminHeader}>
                      <View style={styles.proAdminAvatar}>
                        <Ionicons name="person" size={24} color="#10B981" />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.proAdminName}>{p.name}</Text>
                        <Text style={styles.proAdminTitle}>{p.title}</Text>
                        <Text style={styles.proAdminRate}>
                          Rate: {p.rates?.standard?.rate || 'Standard'}{p.rates?.standard?.unit || '/hr'} • {p.category || 'General'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.proAdminFooter}>
                      <TouchableOpacity
                        style={styles.proViewBtn}
                        onPress={() => router.push(`/provider/${p.id}` as any)}
                      >
                        <Ionicons name="eye-outline" size={14} color="#10B981" style={{ marginRight: 4 }} />
                        <Text style={styles.proViewBtnText}>View Public Profile</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {/* TAB 4: BOOKINGS MONITOR */}
          {activeTab === 'bookings' && (
            <View style={styles.tabContent}>
              <Text style={styles.sectionHeader}>ALL PLATFORM BOOKINGS ({bookings.length})</Text>

              {bookings.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="receipt-outline" size={32} color="#9CA3AF" />
                  <Text style={styles.emptyText}>No bookings placed in the database.</Text>
                </View>
              ) : (
                bookings.map((b) => (
                  <View key={b.id} style={styles.bookingCard}>
                    <View style={styles.bookingCardHeader}>
                      <Text style={styles.bookingIdText}>{b.id}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          b.status === 'Completed'
                            ? styles.statusCompleted
                            : b.status === 'Cancelled'
                            ? styles.statusCancelled
                            : styles.statusUpcoming,
                        ]}
                      >
                        <Text style={styles.statusBadgeText}>{b.status}</Text>
                      </View>
                    </View>

                    <Text style={styles.bookingServiceTitle}>{b.serviceTitle}</Text>
                    <Text style={styles.bookingProText}>Assigned Pro: {b.providerName}</Text>
                    <Text style={styles.bookingClientText}>Client: {b.userName || 'Client'} ({b.userPhone || 'No Phone'})</Text>
                    
                    <View style={styles.bookingLocationBox}>
                      <Ionicons name="location-outline" size={14} color="#6B7280" style={{ marginRight: 4 }} />
                      <Text style={styles.bookingLocationText} numberOfLines={1}>
                        {b.addressLine1}, {b.addressLine2}
                      </Text>
                    </View>

                    <View style={styles.bookingMetaRow}>
                      <Text style={styles.bookingMetaText}>
                        {b.selectedDate} • {b.selectedTime}
                      </Text>
                      <Text style={styles.bookingPrice}>LKR {b.totalAmount}</Text>
                    </View>

                    {/* Quick status update buttons */}
                    <View style={styles.bookingAdminActions}>
                      {b.status !== 'Completed' && (
                        <TouchableOpacity
                          style={[styles.bookingStatusBtn, { backgroundColor: '#ECFDF5' }]}
                          onPress={() => handleUpdateBookingStatus(b.id, 'Completed')}
                        >
                          <Ionicons name="checkmark-circle" size={14} color="#059669" style={{ marginRight: 4 }} />
                          <Text style={[styles.bookingStatusBtnText, { color: '#059669' }]}>Complete</Text>
                        </TouchableOpacity>
                      )}

                      {b.status !== 'Cancelled' && (
                        <TouchableOpacity
                          style={[styles.bookingStatusBtn, { backgroundColor: '#FEF2F2' }]}
                          onPress={() => handleUpdateBookingStatus(b.id, 'Cancelled')}
                        >
                          <Ionicons name="close-circle" size={14} color="#DC2626" style={{ marginRight: 4 }} />
                          <Text style={[styles.bookingStatusBtnText, { color: '#DC2626' }]}>Cancel</Text>
                        </TouchableOpacity>
                      )}

                      {b.status !== 'Upcoming' && (
                        <TouchableOpacity
                          style={[styles.bookingStatusBtn, { backgroundColor: '#EFF6FF' }]}
                          onPress={() => handleUpdateBookingStatus(b.id, 'Upcoming')}
                        >
                          <Ionicons name="refresh" size={14} color="#2563EB" style={{ marginRight: 4 }} />
                          <Text style={[styles.bookingStatusBtnText, { color: '#2563EB' }]}>Re-Open</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))
              )}
              {/* Global Admin Logout at bottom of view */}
              <TouchableOpacity
                style={styles.adminBottomLogoutBtn}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Ionicons name="log-out-outline" size={18} color="#EF4444" style={{ marginRight: 8 }} />
                <Text style={styles.adminBottomLogoutText}>Log Out from Admin Session</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* TAB 5: TICKETS MANAGEMENT */}
          {activeTab === 'tickets' && (
            <View style={styles.tabContent}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionHeader}>SUPPORT TICKETS ({tickets.length})</Text>
                <TouchableOpacity
                  style={[styles.refreshIconBtn]}
                  onPress={handleRefresh}
                >
                  <Ionicons name="refresh" size={16} color="#4F46E5" />
                  <Text style={styles.refreshIconBtnText}>Sync</Text>
                </TouchableOpacity>
              </View>

              {/* Ticket Search Bar */}
              <View style={styles.searchRow}>
                <Ionicons name="search" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Search tickets by subject, user, or ID..."
                  placeholderTextColor="#9CA3AF"
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery !== '' && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Status Filter Pills */}
              <View style={styles.roleFilterRow}>
                {(['all', 'Open', 'In Progress', 'Resolved', 'Closed'] as const).map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[
                      styles.roleFilterPill,
                      ticketStatusFilter === st && styles.roleFilterPillActive,
                    ]}
                    onPress={() => setTicketStatusFilter(st)}
                  >
                    <Text
                      style={[
                        styles.roleFilterText,
                        ticketStatusFilter === st && styles.roleFilterTextActive,
                      ]}
                    >
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {filteredTickets.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="chatbubble-ellipses-outline" size={32} color="#9CA3AF" />
                  <Text style={styles.emptyText}>No support tickets found.</Text>
                </View>
              ) : (
                filteredTickets.map((t) => (
                  <View key={t.id} style={styles.ticketAdminCard}>
                    <View style={styles.ticketCardHeader}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                          <View
                            style={[
                              styles.ticketPriorityBadge,
                              t.priority === 'Urgent'
                                ? { backgroundColor: '#FEE2E2' }
                                : t.priority === 'High'
                                ? { backgroundColor: '#FFEDD5' }
                                : t.priority === 'Medium'
                                ? { backgroundColor: '#FEF3C7' }
                                : { backgroundColor: '#F3F4F6' },
                            ]}
                          >
                            <Text
                              style={[
                                styles.ticketPriorityText,
                                t.priority === 'Urgent'
                                  ? { color: '#DC2626' }
                                  : t.priority === 'High'
                                  ? { color: '#EA580C' }
                                  : t.priority === 'Medium'
                                  ? { color: '#D97706' }
                                  : { color: '#4B5563' },
                              ]}
                            >
                              {t.priority}
                            </Text>
                          </View>

                          <View
                            style={[
                              styles.statusBadge,
                              t.status === 'Open'
                                ? { backgroundColor: '#EFF6FF' }
                                : t.status === 'In Progress'
                                ? { backgroundColor: '#FEF3C7' }
                                : t.status === 'Resolved'
                                ? { backgroundColor: '#ECFDF5' }
                                : { backgroundColor: '#F3F4F6' },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusBadgeText,
                                t.status === 'Open'
                                  ? { color: '#2563EB' }
                                  : t.status === 'In Progress'
                                  ? { color: '#D97706' }
                                  : t.status === 'Resolved'
                                  ? { color: '#059669' }
                                  : { color: '#6B7280' },
                              ]}
                            >
                              {t.status}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.ticketAdminSubject}>{t.subject}</Text>
                        <Text style={styles.ticketAdminMeta}>
                          #{t.id.slice(0, 8)} • {t.topic} • {new Date(t.createdAt).toLocaleDateString()}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.ticketDeleteBtn}
                        onPress={() => handleDeleteTicket(t)}
                      >
                        <Ionicons name="trash-outline" size={16} color="#DC2626" />
                      </TouchableOpacity>
                    </View>

                    {/* Client Info Box */}
                    <View style={styles.ticketClientBox}>
                      <Ionicons name="person-circle-outline" size={16} color="#4B5563" style={{ marginRight: 6 }} />
                      <Text style={styles.ticketClientText}>
                        Client: <Text style={{ fontWeight: '600' }}>{t.userName}</Text> ({t.userEmail})
                      </Text>
                    </View>

                    {/* Ticket message body */}
                    <View style={styles.ticketDescriptionBox}>
                      <Text style={styles.ticketDescriptionText}>{t.description}</Text>
                    </View>

                    {/* Admin Response if available */}
                    {t.adminResponse && (
                      <View style={styles.existingAdminResponseBox}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                          <Ionicons name="shield-checkmark" size={14} color="#059669" style={{ marginRight: 4 }} />
                          <Text style={styles.existingAdminResponseLabel}>Staff Response</Text>
                        </View>
                        <Text style={styles.existingAdminResponseText}>{t.adminResponse}</Text>
                      </View>
                    )}

                    {/* Action buttons */}
                    <View style={styles.ticketActionRow}>
                      <TouchableOpacity
                        style={styles.ticketReplyBtn}
                        onPress={() => {
                          setSelectedTicket(t);
                          setAdminResponseText(t.adminResponse || '');
                          setIsTicketModalVisible(true);
                        }}
                      >
                        <Ionicons name="chatbubble-outline" size={14} color="#FFF" style={{ marginRight: 4 }} />
                        <Text style={styles.ticketReplyBtnText}>
                          {t.adminResponse ? 'Edit Reply' : 'Reply to Client'}
                        </Text>
                      </TouchableOpacity>

                      {/* Status changes */}
                      {t.status !== 'In Progress' && (
                        <TouchableOpacity
                          style={[styles.ticketStatusChangeBtn, { backgroundColor: '#FEF3C7' }]}
                          onPress={() => handleUpdateTicketStatus(t.id, 'In Progress')}
                        >
                          <Text style={[styles.ticketStatusChangeText, { color: '#D97706' }]}>In Progress</Text>
                        </TouchableOpacity>
                      )}

                      {t.status !== 'Resolved' && (
                        <TouchableOpacity
                          style={[styles.ticketStatusChangeBtn, { backgroundColor: '#ECFDF5' }]}
                          onPress={() => handleUpdateTicketStatus(t.id, 'Resolved')}
                        >
                          <Text style={[styles.ticketStatusChangeText, { color: '#059669' }]}>Resolve</Text>
                        </TouchableOpacity>
                      )}

                      {t.status !== 'Closed' && (
                        <TouchableOpacity
                          style={[styles.ticketStatusChangeBtn, { backgroundColor: '#F3F4F6' }]}
                          onPress={() => handleUpdateTicketStatus(t.id, 'Closed')}
                        >
                          <Text style={[styles.ticketStatusChangeText, { color: '#4B5563' }]}>Close</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))
              )}

              {/* Global Admin Logout at bottom of tickets view */}
              <TouchableOpacity
                style={styles.adminBottomLogoutBtn}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Ionicons name="log-out-outline" size={18} color="#EF4444" style={{ marginRight: 8 }} />
                <Text style={styles.adminBottomLogoutText}>Log Out from Admin Session</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Admin Ticket Response Modal */}
      <Modal
        visible={isTicketModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsTicketModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          {/* Backdrop */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setIsTicketModalVisible(false)}
          />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Support Ticket Response</Text>
              <TouchableOpacity onPress={() => setIsTicketModalVisible(false)}>
                <Ionicons name="close" size={20} color="#111827" />
              </TouchableOpacity>
            </View>

            {selectedTicket && (
              <>
                <Text style={styles.modalSub}>
                  Ticket: <Text style={{ fontWeight: 'bold' }}>{selectedTicket.subject}</Text>
                </Text>
                <Text style={[styles.ticketAdminMeta, { marginBottom: 12 }]}>
                  From: {selectedTicket.userName} ({selectedTicket.userEmail})
                </Text>

                <TextInput
                  placeholder="Write your official response or update to the customer here..."
                  placeholderTextColor="#9CA3AF"
                  style={styles.adminReplyInput}
                  multiline
                  numberOfLines={4}
                  value={adminResponseText}
                  onChangeText={setAdminResponseText}
                />

                <View style={styles.ticketModalBtnRow}>
                  <TouchableOpacity
                    style={styles.ticketModalCancelBtn}
                    onPress={() => setIsTicketModalVisible(false)}
                    disabled={submittingTicketUpdate}
                  >
                    <Text style={styles.ticketModalCancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.ticketModalSaveBtn}
                    onPress={handleSaveAdminResponse}
                    disabled={submittingTicketUpdate}
                  >
                    {submittingTicketUpdate ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.ticketModalSaveText}>Submit Response</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Role Picker Modal */}
      <Modal
        visible={isRoleModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsRoleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          {/* Backdrop */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setIsRoleModalVisible(false)}
          />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Account Role</Text>
              <TouchableOpacity onPress={() => setIsRoleModalVisible(false)}>
                <Ionicons name="close" size={20} color="#111827" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Select new authority level for <Text style={{ fontWeight: 'bold' }}>{selectedUser?.name || selectedUser?.email}</Text>:
            </Text>

            {(['customer', 'provider', 'admin'] as const).map((r) => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.roleOption,
                  selectedUser?.role === r && styles.roleOptionSelected,
                ]}
                onPress={() => handleChangeUserRole(r)}
                disabled={updatingRole}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons
                    name={
                      r === 'admin'
                        ? 'shield-checkmark'
                        : r === 'provider'
                        ? 'construct'
                        : 'person'
                    }
                    size={18}
                    color={
                      r === 'admin' ? '#DC2626' : r === 'provider' ? '#10B981' : '#3B82F6'
                    }
                    style={{ marginRight: 10 }}
                  />
                  <Text style={styles.roleOptionName}>{r.toUpperCase()}</Text>
                </View>
                {selectedUser?.role === r && (
                  <Ionicons name="checkmark" size={18} color="#10B981" />
                )}
              </TouchableOpacity>
            ))}

            {updatingRole && (
              <ActivityIndicator size="small" color="#EF4444" style={{ marginTop: 12 }} />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#111827' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  adminShieldBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  adminTitleRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#FFF' },
  headerSubtitle: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#DC2626',
  },
  logoutBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  adminBottomLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  adminBottomLogoutText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabItemActive: { backgroundColor: '#374151' },
  tabText: { fontSize: 12, fontWeight: '600', color: '#9CA3AF', marginLeft: 5 },
  tabTextActive: { color: '#FFF', fontWeight: 'bold' },
  scrollContent: { flex: 1, backgroundColor: '#F3F4F6' },
  tabContent: { padding: 16 },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: { fontSize: 13, color: '#DC2626', fontWeight: 'bold' },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: '#FFF',
    width: '48%',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  metricIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricValue: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  metricLabel: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  quickActionsCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionTitle: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  actionSub: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  actionDivider: { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 12 },
  emptyCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { fontSize: 13, color: '#6B7280', marginTop: 8 },
  bookingCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bookingIdText: { fontSize: 13, fontWeight: 'bold', color: '#111827' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  statusUpcoming: { backgroundColor: '#FEF3C7' },
  statusCompleted: { backgroundColor: '#D1FAE5' },
  statusCancelled: { backgroundColor: '#FEE2E2' },
  statusBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#374151' },
  bookingServiceTitle: { fontSize: 15, fontWeight: 'bold', color: '#111827', marginBottom: 2 },
  bookingProText: { fontSize: 13, color: '#4B5563', marginBottom: 2 },
  bookingClientText: { fontSize: 12, color: '#6B7280', marginBottom: 6 },
  bookingLocationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 6,
    borderRadius: 6,
    marginBottom: 8,
  },
  bookingLocationText: { fontSize: 12, color: '#4B5563', flex: 1 },
  bookingMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  bookingMetaText: { fontSize: 12, color: '#6B7280' },
  bookingPrice: { fontSize: 14, fontWeight: 'bold', color: '#10B981' },
  bookingAdminActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  bookingStatusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginLeft: 8,
  },
  bookingStatusBtnText: { fontSize: 11, fontWeight: 'bold' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: { flex: 1, height: '100%', fontSize: 13, color: '#111827' },
  roleFilterRow: { flexDirection: 'row', marginBottom: 16 },
  roleFilterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    marginRight: 8,
  },
  roleFilterPillActive: { backgroundColor: '#DC2626' },
  roleFilterText: { fontSize: 11, fontWeight: 'bold', color: '#6B7280' },
  roleFilterTextActive: { color: '#FFF' },
  userCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userCardHeader: { flexDirection: 'row', alignItems: 'center' },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  userNameText: { fontSize: 15, fontWeight: 'bold', color: '#111827' },
  userEmailText: { fontSize: 12, color: '#6B7280', marginTop: 1 },
  roleBadgeContainer: { flexDirection: 'row', marginTop: 4 },
  userRoleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  roleBadgeAdmin: { backgroundColor: '#FEE2E2' },
  roleBadgeProvider: { backgroundColor: '#D1FAE5' },
  roleBadgeCustomer: { backgroundColor: '#DBEAFE' },
  userRoleBadgeText: { fontSize: 9, fontWeight: 'bold' },
  userActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  changeRoleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 8,
  },
  changeRoleBtnText: { fontSize: 11, fontWeight: '600', color: '#374151' },
  deleteUserBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  deleteUserBtnText: { fontSize: 11, fontWeight: '600', color: '#DC2626' },
  addNewProBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addNewProText: { fontSize: 12, fontWeight: 'bold', color: '#FFF' },
  proAdminCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  proAdminHeader: { flexDirection: 'row', alignItems: 'center' },
  proAdminAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  proAdminName: { fontSize: 15, fontWeight: 'bold', color: '#111827' },
  proAdminTitle: { fontSize: 12, color: '#6B7280', marginTop: 1 },
  proAdminRate: { fontSize: 12, color: '#10B981', fontWeight: '500', marginTop: 2 },
  proAdminFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  proViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  proViewBtnText: { fontSize: 11, fontWeight: '600', color: '#059669' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6' },
  loadingText: { marginTop: 10, fontSize: 13, color: '#6B7280' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFF',
    width: '100%',
    borderRadius: 16,
    padding: 20,
    maxWidth: 380,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  modalSub: { fontSize: 13, color: '#6B7280', marginBottom: 16, lineHeight: 18 },
  roleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  roleOptionSelected: { borderColor: '#10B981', backgroundColor: '#ECFDF5' },
  roleOptionName: { fontSize: 13, fontWeight: 'bold', color: '#111827' },
  // Tickets tab styles
  refreshIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  refreshIconBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginLeft: 4,
  },
  ticketAdminCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
  },
  ticketCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ticketPriorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  ticketPriorityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  ticketAdminSubject: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  ticketAdminMeta: {
    fontSize: 11,
    color: '#6B7280',
  },
  ticketDeleteBtn: {
    padding: 6,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  ticketClientBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  ticketClientText: {
    fontSize: 12,
    color: '#4B5563',
  },
  ticketDescriptionBox: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  ticketDescriptionText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  existingAdminResponseBox: {
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  existingAdminResponseLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#059669',
  },
  existingAdminResponseText: {
    fontSize: 12,
    color: '#065F46',
    lineHeight: 16,
  },
  ticketActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  ticketReplyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ticketReplyBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
  },
  ticketStatusChangeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ticketStatusChangeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  adminReplyInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 14,
    color: '#111827',
    textAlignVertical: 'top',
    height: 110,
    marginBottom: 16,
  },
  ticketModalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  ticketModalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  ticketModalCancelText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4B5563',
  },
  ticketModalSaveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
    minWidth: 120,
    alignItems: 'center',
  },
  ticketModalSaveText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
