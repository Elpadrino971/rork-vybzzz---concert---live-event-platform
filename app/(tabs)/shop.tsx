import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ticket, Package, Sparkles, TrendingUp } from 'lucide-react-native';
import { useTheme } from '@/hooks/theme-context';
import { mockEvents } from '@/mocks/events';
import EventCard from '@/components/EventCard';
import { Image } from 'expo-image';

export default function ShopScreen() {
  const { colors } = useTheme();
  const [selectedTab, setSelectedTab] = useState<'tickets' | 'merch' | 'vip'>('tickets');

  const tabs = [
    { id: 'tickets', label: 'Tickets', icon: Ticket },
    { id: 'merch', label: 'Merch', icon: Package },
    { id: 'vip', label: 'VIP', icon: Sparkles },
  ];

  const hotDeals = mockEvents.filter(e => e.ticketsAvailable).slice(0, 3);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Shop</Text>
          
          {/* Tabs */}
          <View style={[styles.tabs, { backgroundColor: colors.surface }]}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.tab,
                    isSelected && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => setSelectedTab(tab.id as 'tickets' | 'merch' | 'vip')}
                >
                  <Icon
                    size={18}
                    color={isSelected ? colors.background : colors.text}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      {
                        color: isSelected ? colors.background : colors.text,
                        fontWeight: isSelected ? 'bold' : 'normal',
                      },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Hot Deals Banner */}
        <View style={[styles.banner, { backgroundColor: colors.accent }]}>
          <View style={styles.bannerContent}>
            <TrendingUp size={24} color="#fff" />
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>Hot Deals This Week!</Text>
              <Text style={styles.bannerSubtitle}>Save up to 30% on select events</Text>
            </View>
          </View>
        </View>

        {/* Content based on selected tab */}
        {selectedTab === 'tickets' && (
          <>
            {/* Featured Events */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Featured Events
              </Text>
              {hotDeals.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </View>

            {/* All Events */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                All Events
              </Text>
              {mockEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </View>
          </>
        )}

        {selectedTab === 'merch' && (
          <View style={styles.section}>
            <View style={styles.merchGrid}>
              {[1, 2, 3, 4].map((i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.merchCard, { backgroundColor: colors.card }]}
                >
                  <Image
                    source={{
                      uri: `https://images.unsplash.com/photo-${
                        i % 2 === 0 ? '1556906781-9a412961c28c' : '1576566427-bc4e5a7e8d3f'
                      }?w=400`,
                    }}
                    style={styles.merchImage}
                  />
                  <View style={styles.merchInfo}>
                    <Text style={[styles.merchTitle, { color: colors.text }]}>
                      Tour T-Shirt {i}
                    </Text>
                    <Text style={[styles.merchPrice, { color: colors.primary }]}>
                      $45
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {selectedTab === 'vip' && (
          <View style={styles.section}>
            <View style={[styles.vipCard, { backgroundColor: colors.card }]}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
                }}
                style={styles.vipImage}
              />
              <View style={styles.vipContent}>
                <Text style={[styles.vipTitle, { color: colors.text }]}>
                  VIP Festival Pass
                </Text>
                <Text style={[styles.vipDescription, { color: colors.textSecondary }]}>
                  Skip the lines, exclusive areas, meet & greets
                </Text>
                <TouchableOpacity
                  style={[styles.vipButton, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.vipButtonText}>Learn More</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
  },
  banner: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  merchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  merchCard: {
    width: '47%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  merchImage: {
    width: '100%',
    height: 180,
  },
  merchInfo: {
    padding: 12,
  },
  merchTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  merchPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  vipCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  vipImage: {
    width: '100%',
    height: 200,
  },
  vipContent: {
    padding: 16,
  },
  vipTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  vipDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  vipButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  vipButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});