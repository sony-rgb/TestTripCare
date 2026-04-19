import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import ScreenHeader from '../../components/common/ScreenHeader';

type RouteParams = {
  article: {
    id: string;
    title: string;
    category: string;
    emoji: string;
    color: string;
    author: string;
    date: string;
    excerpt: string;
  };
};

export default function ArticleScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { article } = route.params;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title={article.category} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <View style={[styles.banner, { backgroundColor: article.color }]}>
          <Text style={styles.bannerEmoji}>{article.emoji}</Text>
        </View>

        {/* Meta */}
        <View style={styles.meta}>
          <Text style={styles.category}>{article.category}</Text>
          <Text style={styles.date}>{article.date} · {article.author}</Text>
        </View>

        <Text style={styles.title}>{article.title}</Text>
        <Text style={styles.excerpt}>{article.excerpt}</Text>

        <View style={styles.divider} />

        <Text style={styles.body}>
          {/* Placeholder body — real content would come from CMS */}
          This is where the full article content will appear, delivered from the TripCare CMS (Contentful). The content is cached on-device for 24 hours for offline reading.{'\n\n'}
          Stay tuned as we continue to build out the Guides section with expert travel advice, pre-built itineraries, and destination-specific tips for travellers across Canada, the US, and beyond.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: { gap: 14 },
  banner: { height: 160, justifyContent: 'center', alignItems: 'center' },
  bannerEmoji: { fontSize: 64 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 4 },
  category: { fontFamily: Fonts.medium, fontSize: 12, color: Colors.blue },
  date: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.muted },
  title: { fontFamily: Fonts.bold, fontSize: 24, color: Colors.text, paddingHorizontal: 20, lineHeight: 32 },
  excerpt: { fontFamily: Fonts.regular, fontSize: 15, color: Colors.muted, paddingHorizontal: 20, lineHeight: 24 },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 20 },
  body: { fontFamily: Fonts.regular, fontSize: 15, color: Colors.text, paddingHorizontal: 20, lineHeight: 26 },
});
