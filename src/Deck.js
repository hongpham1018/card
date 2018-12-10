import React, {Component} from 'react';
import {Animated,
  StyleSheet,
  View,
  PanResponder,
  Dimensions,
  LayoutAnimation,
  UIManager
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH *.25;
const SWIPE_OUT_DURATION = 250 //milliseconds

class Deck extends Component {
  static defaultProps = {
    onSwipeLeft:()=>{},
    onSwipeRight:()=>{}
  }
  constructor(props){
    super(props);
    const position = new Animated.ValueXY();
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder:()=>true,
      onPanResponderMove:(event, gesture)=>{
        position.setValue({x:gesture.dx, y:gesture.dy})
      },
      onPanResponderRelease:(event, gesture)=>{
        this.onResponderRelease(event, gesture);
      }
    })
   this.state= {panResponder, position, index:0}
  }
  componentWillUpdate(){
    UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    LayoutAnimation.spring();
  }
  onResponderRelease(event, gesture){
    if(gesture.dx > SWIPE_THRESHOLD){
      this.forceSwipe("right");
    }else if(gesture.dx < -SWIPE_THRESHOLD)
      this.forceSwipe("left");
    else this.resetPosition();
  }
  //exiting card
  forceSwipe(direction){
    const x= (direction ==='right') ? SCREEN_WIDTH:-SCREEN_WIDTH;
    Animated.timing(this.state.position, {
      toValue:{x, y:0},
      duration: SWIPE_OUT_DURATION
    }).start(()=>this.onSwipeComplete(direction));
  }
  onSwipeComplete(direction){
    const {onSwipeRight, onSwipeLeft, data} = this.props;
    const item = data[this.state.index];
    (direction === 'right')? onSwipeRight(item): onSwipeLeft(item);
    this.state.position.setValue({x:0, y:0});
    this.setState({index : this.state.index + 1});
  }
  resetPosition(){
    Animated.spring(this.state.position, {
      toValue:{x:0, y:0}
    }).start();
  }
  getCardStyle (){
    const {position} = this.state;
    const rotate = position.x.interpolate({
      inputRange:[-SCREEN_WIDTH*1.5, 0, SCREEN_WIDTH*1.5],
      outputRange:['-120deg', '0deg', '120deg']
    })
    return {
      ...position.getLayout(),
      transform:[{rotate}] //counter clockwise

    }
  }
  renderCards(){
    if(this.state.index >= this.props.data.length ){
      return this.props.renderNoMoreCards();
    }
    return this.props.data.map((item, i )=>{
      if(i < this.state.index)
        {return null}
      else if (i === this.state.index ){
        return (<Animated.View
          key={item.id}
          style={[this.cardStyle,this.getCardStyle()]}
          {...this.state.panResponder.panHandlers}>
          {this.props.renderCard(item)}
        </Animated.View>
        )
      }
      return (
        <Animated.View style = {[styles.cardStyle, {top:10 * (i-this.state.index)}]} key = {item.id}>
        {this.props.renderCard(item)}
        </Animated.View>
      )
    }).reverse();
  }
  render(){
    return (<View>{this.renderCards()}
    </View>)

  }
}
const styles = StyleSheet.create({
  cardStyle:{
    position:'absolute',
    width:SCREEN_WIDTH
  }
})

export default Deck;
