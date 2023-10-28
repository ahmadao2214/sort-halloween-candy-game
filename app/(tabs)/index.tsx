import React, { useState, useEffect, useRef } from 'react';
import { PanResponder, View, Text, StyleSheet, Animated, Platform, Dimensions } from 'react-native';

const isWeb = Platform.OS === 'web';
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const candyTypes = ['chocolate', 'gummy', 'candyCorn']

export const Candy = ({ id, x, y, onDrop, candyType, setHoveredBowl }: any) => {
  const initialTouch = useRef({ x: 0, y: 0 });
  const initialPosition = useRef({ x, y });
  const position = useRef(new Animated.ValueXY({ x: screenWidth / 2, y: 0 })).current;

  const candyTypeStyle: {[key: string]: string} = {
    chocolate: 'maroon' ,
    gummy: 'chartreuse' ,
    candyCorn: 'orange' ,
  }
  
  useEffect(() => {
    Animated.spring(position, {
      toValue: { x, y },
      useNativeDriver: false,
    }).start();
  }, []);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      initialTouch.current.x = evt.nativeEvent.pageX - position.x._value;
      initialTouch.current.y = evt.nativeEvent.pageY - position.y._value;
      return true;
    },
    onPanResponderMove: (evt, gestureState) => {
      position.setValue({
          x: gestureState.moveX - initialTouch.current.x,
          y: gestureState.moveY - initialTouch.current.y,
      });
      const hoveringOver = getDropZone(gestureState);
      setHoveredBowl(hoveringOver);
    },
    onPanResponderRelease: (e, gesture) => {
      onDrop(id, gesture);
      setHoveredBowl(-1);
      Animated.spring(position, {
        toValue: initialPosition.current,
        useNativeDriver: false,
      }).start();
    }
  });

  return (
    <Animated.View
      style={[{...position.getLayout(), zIndex: 10 }]}
      {...panResponder.panHandlers}
    >
      <View style={[styles.candy, {backgroundColor: candyTypeStyle[candyType]}]} />
    </Animated.View>
  );
};

function generateRandomCandies(num: number) {
  const bowlHeight = 100;
  const maxX = isWeb ? screenWidth - 500 : 0;
  const maxY = screenHeight - bowlHeight - 250;
  const array = [];
  for (let i = 0; i < num; i++) {
    const candyType = candyTypes[Math.floor(Math.random() * candyTypes.length)];
    array.push({
      id: i,
      x: 0, //Math.random() * maxX,
      y: Math.random() * maxY,
      dropped: false,
      candyType
    });
  }
  return array;
}

function getDropZone(gesture) {
  const Y_THRESHOLD = isWeb ? screenHeight - 175 : 650; 
  if (gesture.moveY > Y_THRESHOLD) {
    const index = Math.floor(gesture.moveX / (screenWidth / 3));
    const maxIndex = 2;
    return Math.min(index, maxIndex);
  }
  return -1;
}

export default function TabOneScreen() {
  const [candies, setCandies] = useState(() => generateRandomCandies(isWeb ? 25 : 8));
  const [bowls, setBowls] = useState([0, 0, 0]);
  const [hoveredBowl, setHoveredBowl] = useState(-1);

  function handleDrop(id: number, gesture: any) {
    const dropZone = getDropZone(gesture);
    if (dropZone !== -1) {
        const candy = candies[id];
        if (candy.candyType === candyTypes[dropZone]){
          const newCandies = [...candies];
          newCandies[id].dropped = true;
          const newBowls = [...bowls];
          newBowls[dropZone]++;
          setCandies(newCandies);
          setBowls(newBowls);
        }
    }
  }

  return (
    <View style={styles.container}>
        {candies.map((candy, idx) => !candy.dropped ? (
          <Candy key={candy.id} {...candy} onDrop={handleDrop} hoveredBowl={hoveredBowl} setHoveredBowl={setHoveredBowl} />
        ) : <View style={[styles.candy, {backgroundColor: 'transparent'}]} key={idx}/>)}
       <View style={styles.bowlContainer}>
            <View style={[styles.pumpkin, hoveredBowl === 0 && {backgroundColor: 'gold'}]}>
                <View style={[styles.pumpkinEyes, {left: 20}]} />
                <View style={[styles.pumpkinEyes, {right: 20}]} />
                <View style={styles.pumpkinMouth} />
                <Text>{bowls[0] > 0 && bowls[0]}</Text>
            </View>
            <View style={[styles.skull, hoveredBowl === 1 && {backgroundColor: 'gold'}]}>
                <View style={[styles.skullEyes, {left: 15}]} />
                <View style={[styles.skullEyes, {right: 15}]} />
                <Text>{bowls[1] > 0 && bowls[1]}</Text>
            </View>
            <View style={[styles.witchHat, hoveredBowl === 2 && {backgroundColor: 'gold'}]}>
                <Text>{bowls[2] > 0 && bowls[2]}</Text>
            </View>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'moccasin' 
  },
  bowlContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  bowl: {
    width: 100,
    height: 100,
    backgroundColor: 'grey',
    justifyContent: 'center',
    alignItems: 'center',
  },
  candy: {
    width: 30,
    height: 30,
    backgroundColor: 'yellow',
    borderRadius: 15,
    margin: 10,
  },
  pumpkin: {
    width: 100,
    height: 100,
    backgroundColor: 'darkorange',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  pumpkinEyes: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: 'black',
    borderRadius: 10,
    top: 35,
  },
  pumpkinMouth: {
    position: 'absolute',
    width: 60,
    height: 20,
    backgroundColor: 'black',
    borderRadius: 10,
    bottom: 15,
  },
  skull: {
    width: 100,
    height: 100,
    backgroundColor: 'white',
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skullEyes: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: 'black',
    borderRadius: 10,
    top: 35,
  },
  witchHat: {
    width: 100,
    height: 100,
    backgroundColor: 'purple',
    borderBottomWidth: 30,
    borderBottomColor: 'black',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
