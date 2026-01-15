import { ThemedText } from "@/components/themed/themed-text";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, View } from "react-native";

// Example 1: Fade transition between icons
function FadeIconTransition() {
  const [isActive, setIsActive] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    setIsActive(!isActive);
  };

  return (
    <View style={styles.example}>
      <ThemedText style={styles.title}>1. Fade Transition</ThemedText>
      <Pressable onPress={handlePress}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Ionicons name={isActive ? "search" : "search-outline"} size={48} color="#007AFF" />
        </Animated.View>
      </Pressable>
    </View>
  );
}

// Example 2: Scale + Fade transition
function ScaleFadeIconTransition() {
  const [isActive, setIsActive] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.5,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    setIsActive(!isActive);
  };

  return (
    <View style={styles.example}>
      <ThemedText style={styles.title}>2. Scale + Fade</ThemedText>
      <Pressable onPress={handlePress}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          <Ionicons name={isActive ? "heart" : "heart-outline"} size={48} color="#FF3B30" />
        </Animated.View>
      </Pressable>
    </View>
  );
}

// Example 3: Crossfade between two icons
function CrossfadeIconTransition() {
  const [isActive, setIsActive] = useState(false);
  const fadeAnim1 = useRef(new Animated.Value(1)).current;
  const fadeAnim2 = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    if (!isActive) {
      Animated.parallel([
        Animated.timing(fadeAnim1, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim2, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim1, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim2, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
    setIsActive(!isActive);
  };

  return (
    <View style={styles.example}>
      <ThemedText style={styles.title}>3. Crossfade</ThemedText>
      <Pressable onPress={handlePress}>
        <View style={{ width: 48, height: 48 }}>
          <Animated.View style={[styles.iconAbsolute, { opacity: fadeAnim1 }]}>
            <Ionicons name="star-outline" size={48} color="#FFA500" />
          </Animated.View>
          <Animated.View style={[styles.iconAbsolute, { opacity: fadeAnim2 }]}>
            <Ionicons name="star" size={48} color="#FFA500" />
          </Animated.View>
        </View>
      </Pressable>
    </View>
  );
}

// Example 4: Rotate + Fade transition
function RotateFadeIconTransition() {
  const [isActive, setIsActive] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    setIsActive(!isActive);
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View style={styles.example}>
      <ThemedText style={styles.title}>4. Rotate + Fade</ThemedText>
      <Pressable onPress={handlePress}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ rotate }],
          }}
        >
          <Ionicons
            name={isActive ? "checkmark-circle" : "checkmark-circle-outline"}
            size={48}
            color="#34C759"
          />
        </Animated.View>
      </Pressable>
    </View>
  );
}

// Example 5: Spring bounce transition
function SpringIconTransition() {
  const [isActive, setIsActive] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.3,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
    setIsActive(!isActive);
  };

  return (
    <View style={styles.example}>
      <ThemedText style={styles.title}>5. Spring Bounce</ThemedText>
      <Pressable onPress={handlePress}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Ionicons name={isActive ? "thumbs-up" : "thumbs-up-outline"} size={48} color="#007AFF" />
        </Animated.View>
      </Pressable>
    </View>
  );
}

// Example 6: Slide up transition
function SlideIconTransition() {
  const [isActive, setIsActive] = useState(false);
  const translateY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -20,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    setIsActive(!isActive);
  };

  return (
    <View style={styles.example}>
      <ThemedText style={styles.title}>6. Slide Up</ThemedText>
      <Pressable onPress={handlePress}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY }],
          }}
        >
          <Ionicons name={isActive ? "bookmark" : "bookmark-outline"} size={48} color="#FF9500" />
        </Animated.View>
      </Pressable>
    </View>
  );
}

// Example 7: Play/Pause icon transition
function PlayPauseTransition() {
  const [isPlaying, setIsPlaying] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(rotateAnim, {
        toValue: isPlaying ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    setIsPlaying(!isPlaying);
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "90deg"],
  });

  return (
    <View style={styles.example}>
      <ThemedText style={styles.title}>7. Play/Pause</ThemedText>
      <Pressable onPress={handlePress}>
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }, { rotate }],
          }}
        >
          <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={48} color="#007AFF" />
        </Animated.View>
      </Pressable>
    </View>
  );
}

// Example 8: Menu toggle icon
function MenuToggleTransition() {
  const [isOpen, setIsOpen] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    Animated.timing(rotateAnim, {
      toValue: isOpen ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View style={styles.example}>
      <ThemedText style={styles.title}>8. Menu Toggle</ThemedText>
      <Pressable onPress={handlePress}>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Ionicons name={isOpen ? "close" : "menu"} size={48} color="#000" />
        </Animated.View>
      </Pressable>
    </View>
  );
}

export default function IconTransitionExamples() {
  return (
    <ScrollView style={styles.container}>
      <FadeIconTransition />
      <ScaleFadeIconTransition />
      <CrossfadeIconTransition />
      <RotateFadeIconTransition />
      <SpringIconTransition />
      <SlideIconTransition />
      <PlayPauseTransition />
      <MenuToggleTransition />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  example: {
    marginBottom: 30,
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
  iconAbsolute: {
    position: "absolute",
    top: 0,
    left: 0,
  },
});
