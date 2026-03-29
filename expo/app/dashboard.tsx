import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { 
  ArrowLeft, 
  BarChart3, 
  DollarSign, 
  Eye, 
  Users, 
  TrendingUp,
  Music,
  Calendar,
  Settings,
  Download,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/theme-context';
import { useLanguage } from '@/hooks/language-context';
import { useUser } from '@/hooks/user-context';

const { width } = Dimensions.get('window');

type DashboardRole = 'artist' | 'business' | 'regional';

interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
}

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  useUser();
  const [selectedRole, setSelectedRole] = useState<DashboardRole>('artist');

  const artistStats: StatCard[] = [
    {
      title: 'Total Views',
      value: '125.4K',
      change: '+12.5%',
      icon: <Eye size={24} color={colors.primary} />,
      color: colors.primary,
    },
    {
      title: 'Revenue',
      value: '$2,847',
      change: '+8.2%',
      icon: <DollarSign size={24} color={colors.success} />,
      color: colors.success,
    },
    {
      title: 'Followers',
      value: '8.9K',
      change: '+15.3%',
      icon: <Users size={24} color={colors.accent} />,
      color: colors.accent,
    },
    {
      title: 'Engagement',
      value: '4.2%',
      change: '+2.1%',
      icon: <TrendingUp size={24} color={colors.error} />,
      color: colors.error,
    },
  ];

  const businessStats: StatCard[] = [
    {
      title: 'Level 1 (2.5%)',
      value: '24',
      change: '+3 this month',
      icon: <Users size={24} color={colors.primary} />,
      color: colors.primary,
    },
    {
      title: 'Level 2 (1.5%)',
      value: '12',
      change: '+2 this month',
      icon: <Users size={24} color={colors.success} />,
      color: colors.success,
    },
    {
      title: 'Level 3 (1%)',
      value: '6',
      change: '+1 this month',
      icon: <Users size={24} color={colors.accent} />,
      color: colors.accent,
    },
    {
      title: 'Total Earnings',
      value: '$1,247',
      change: '+18.5%',
      icon: <DollarSign size={24} color={colors.error} />,
      color: colors.error,
    },
  ];

  const regionalStats: StatCard[] = [
    {
      title: 'Ticket Sales',
      value: '1,234',
      change: '+22.1%',
      icon: <BarChart3 size={24} color={colors.primary} />,
      color: colors.primary,
    },
    {
      title: 'Attendance Rate',
      value: '87.5%',
      change: '+5.2%',
      icon: <TrendingUp size={24} color={colors.success} />,
      color: colors.success,
    },
    {
      title: 'Revenue Generated',
      value: '$45,678',
      change: '+12.8%',
      icon: <DollarSign size={24} color={colors.accent} />,
      color: colors.accent,
    },
    {
      title: 'Local Artists',
      value: '156',
      change: '+8 this month',
      icon: <Music size={24} color={colors.error} />,
      color: colors.error,
    },
  ];

  const getCurrentStats = () => {
    switch (selectedRole) {
      case 'artist':
        return artistStats;
      case 'business':
        return businessStats;
      case 'regional':
        return regionalStats;
      default:
        return artistStats;
    }
  };

  const getRoleTitle = () => {
    switch (selectedRole) {
      case 'artist':
        return t('dashboard.artist');
      case 'business':
        return t('dashboard.businessIntroducer');
      case 'regional':
        return t('dashboard.regionalManager');
      default:
        return t('dashboard.artist');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      padding: 8,
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '600' as const,
      color: colors.text,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    roleSelector: {
      flexDirection: 'row',
      marginBottom: 24,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 4,
    },
    roleOption: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderRadius: 8,
      alignItems: 'center',
    },
    roleOptionActive: {
      backgroundColor: colors.primary,
    },
    roleOptionText: {
      fontSize: 12,
      fontWeight: '600' as const,
      color: colors.text,
      textAlign: 'center',
    },
    roleOptionTextActive: {
      color: colors.background,
    },
    dashboardTitle: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      color: colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    statCard: {
      width: (width - 60) / 2,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
    },
    statHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    statTitle: {
      fontSize: 14,
      color: colors.textSecondary,
      flex: 1,
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      color: colors.text,
      marginBottom: 4,
    },
    statChange: {
      fontSize: 12,
      fontWeight: '600' as const,
      color: colors.success,
    },
    quickActions: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      color: colors.text,
      marginBottom: 16,
    },
    actionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    actionButton: {
      width: (width - 80) / 2,
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionIcon: {
      marginBottom: 8,
    },
    actionText: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: colors.text,
      textAlign: 'center',
    },
    recentActivity: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
    },
    activityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    activityIcon: {
      marginRight: 12,
    },
    activityContent: {
      flex: 1,
    },
    activityTitle: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: colors.text,
      marginBottom: 2,
    },
    activityTime: {
      fontSize: 12,
      color: colors.textSecondary,
    },
  });

  const getQuickActions = () => {
    switch (selectedRole) {
      case 'artist':
        return [
          { icon: <Music size={20} color={colors.primary} />, text: 'Upload Content' },
          { icon: <BarChart3 size={20} color={colors.primary} />, text: 'View Analytics' },
          { icon: <DollarSign size={20} color={colors.primary} />, text: 'Payments' },
          { icon: <Settings size={20} color={colors.primary} />, text: 'Settings' },
        ];
      case 'business':
        return [
          { icon: <Users size={20} color={colors.primary} />, text: 'View Referrals' },
          { icon: <BarChart3 size={20} color={colors.primary} />, text: 'Commission Report' },
          { icon: <DollarSign size={20} color={colors.primary} />, text: 'Earnings' },
          { icon: <Download size={20} color={colors.primary} />, text: 'Export Data' },
        ];
      case 'regional':
        return [
          { icon: <Calendar size={20} color={colors.primary} />, text: 'Manage Events' },
          { icon: <Music size={20} color={colors.primary} />, text: 'Artist Network' },
          { icon: <BarChart3 size={20} color={colors.primary} />, text: 'Regional Stats' },
          { icon: <Download size={20} color={colors.primary} />, text: 'Export Reports' },
        ];
      default:
        return [];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="back-button"
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('dashboard.title')}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.roleSelector}>
          <TouchableOpacity
            style={[
              styles.roleOption,
              selectedRole === 'artist' && styles.roleOptionActive,
            ]}
            onPress={() => setSelectedRole('artist')}
            testID="artist-role"
          >
            <Text
              style={[
                styles.roleOptionText,
                selectedRole === 'artist' && styles.roleOptionTextActive,
              ]}
            >
              Artist
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.roleOption,
              selectedRole === 'business' && styles.roleOptionActive,
            ]}
            onPress={() => setSelectedRole('business')}
            testID="business-role"
          >
            <Text
              style={[
                styles.roleOptionText,
                selectedRole === 'business' && styles.roleOptionTextActive,
              ]}
            >
              Business
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.roleOption,
              selectedRole === 'regional' && styles.roleOptionActive,
            ]}
            onPress={() => setSelectedRole('regional')}
            testID="regional-role"
          >
            <Text
              style={[
                styles.roleOptionText,
                selectedRole === 'regional' && styles.roleOptionTextActive,
              ]}
            >
              Regional
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.dashboardTitle}>{getRoleTitle()}</Text>

        <View style={styles.statsGrid}>
          {getCurrentStats().map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statTitle}>{stat.title}</Text>
                {stat.icon}
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statChange}>{stat.change}</Text>
            </View>
          ))}
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            {getQuickActions().map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionButton}
                testID={`action-${index}`}
              >
                <View style={styles.actionIcon}>{action.icon}</View>
                <Text style={styles.actionText}>{action.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.recentActivity}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <TrendingUp size={16} color={colors.success} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>New milestone reached</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <DollarSign size={16} color={colors.primary} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Payment received</Text>
              <Text style={styles.activityTime}>1 day ago</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Users size={16} color={colors.accent} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>New follower gained</Text>
              <Text style={styles.activityTime}>2 days ago</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}