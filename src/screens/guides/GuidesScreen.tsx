import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';

const CATEGORIES = ['All', 'Tips', 'Itineraries', 'Outdoors', 'Family', 'City Breaks'];

const ARTICLES = [
  { id: '1', title: 'Why Itineraries Make Trips Smoother', category: 'Tips', emoji: '📋', color: '#dbeafe', author: 'TripCare Team', date: 'Mar 2026', excerpt: 'Discover how a well-planned itinerary can reduce travel stress and help you make the most of every destination.' },
  { id: '2', title: '8 Days in Orlando — The Ultimate Guide', category: 'Itineraries', emoji: '🎡', color: '#fef3c7', author: 'TripCare Team', date: 'Feb 2026', excerpt: 'Theme parks, dining, and day trips — everything you need for a perfect Orlando family vacation.' },
  { id: '3', title: '7 Days in Alberta\'s National Parks', category: 'Outdoors', emoji: '🏔️', color: '#d1fae5', author: 'TripCare Team', date: 'Feb 2026', excerpt: 'Banff, Jasper, and Lake Louise — a complete hiking and wildlife itinerary for Alberta\'s crown jewels.' },
  { id: '4', title: 'Ontario Road Trip with Kids', category: 'Family', emoji: '🚗', color: '#fce7f3', author: 'TripCare Team', date: 'Jan 2026', excerpt: 'From Niagara Falls to Algonquin Park, a family-friendly road trip across beautiful Ontario.' },
  { id: '5', title: 'NYC Long Weekend Itinerary', category: 'City Breaks', emoji: '🗽', color: '#ede9fe', author: 'TripCare Team', date: 'Jan 2026', excerpt: '48 hours in New York City — museums, food, and iconic landmarks without the overwhelm.' },
  { id: '6', title: 'East Coast USA Road Trip', category: 'Itineraries', emoji: '🦞', color: '#d1fae5', author: 'TripCare Team', date: 'Dec 2025', excerpt: 'Boston to Miami — a 14-day road trip covering the best of America\'s East Coast.' },
  { id: '7', title: 'Packing Tips for Long-Haul Flights', category: 'Tips', emoji: '🧳', color: '#dbeafe', author: 'TripCare Team', date: 'Dec 2025', excerpt: 'What to bring, what to leave behind, and how to stay comfortable on flights over 8 hours.' },
  { id: '8', title: 'Travelling as a Family — Survival Guide', category: 'Family', emoji: '👨‍👩‍👧‍👦', color: '#fef3c7', author: 'TripCare Team', date: 'Nov 2025', excerpt: 'Practical tips from seasoned family travellers to keep everyone happy on the road.' },
];

export default function GuidesScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? ARTICLES
    : ARTICLES.filter((a) => a.category === activeCategory);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Guides</Text>
        <Text style={styles.subtitle}>Tips, itineraries & destination guides</Text>
      </View>

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catScroll}
        contentContainerStyle={styles.catTabs}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catTab, activeCategory === cat && styles.catTabActive]}
            onPress={() => setActiveCategory(cat)}
            activeOpacity={0.7}
          >
            <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Article', { article: item })}
            activeOpacity={0.88}
          >
            <View style={[styles.cardBanner, { backgroundColor: item.color }]}>
              <Text style={styles.cardEmoji}>{item.emoji}</Text>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.cardMeta}>
                <View style={styles.catPill}>
                  <Text style={styles.catPillText}>{item.category}</Text>
                </View>
                <Text style={styles.cardDate}>{item.date}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardExcerpt} numberOfLines={2}>{item.excerpt}</Text>
              <Text style={styles.readMore}>Read article →</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.text },
  subtitle: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.muted, marginTop: 2 },
  catScroll: { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  catTabs: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  catTab: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  catTabActive: { backgroundColor: Colors.blue, borderColor: Colors.blue },
  catText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.muted },
  catTextActive: { color: Colors.white },
  list: { padding: 16, gap: 16 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardBanner: { height: 80, justifyContent: 'center', alignItems: 'center' },
  cardEmoji: { fontSize: 36 },
  cardBody: { padding: 14, gap: 6 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catPill: { backgroundColor: Colors.blueBg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  catPillText: { fontFamily: Fonts.medium, fontSize: 11, color: Colors.blue },
  cardDate: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.muted },
  cardTitle: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.text, lineHeight: 22 },
  cardExcerpt: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.muted, lineHeight: 19 },
  readMore: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.blue, marginTop: 2 },
});
