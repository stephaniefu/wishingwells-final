import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, Button, ScrollView, FlatList, RefreshControl, Image} from 'react-native';
import { Actions } from 'react-native-router-flux'
import * as firebase from 'firebase'
import NavigationBar from 'react-native-navbar'
import { connect } from 'react-redux'
import { setSavings } from '../Actions/Savings/SavingsAction'
import { setUserInfo } from '../Actions/Profile/ProfileAction'
import { setUserPhoto } from '../Actions/Profile/PhotoAction'
import { setBitcoinValue } from '../Actions/Bitcoin/BitcoinAction'
import axios from 'axios'
import { VictoryLine, VictoryChart, VictoryTheme, VictoryPie} from "victory-native"
import { HOST_IP } from '../../config.js'
import * as Progress from 'react-native-progress'
import TimerMixin from 'react-timer-mixin'
import reactMixin from 'react-mixin'

const mapStateToProps = (state) => {
  return {
    uid: state.ProfileReducer.uid,
    logs: state.SavingsReducer.entries,
    username: state.ProfileReducer.username,
    firstname: state.ProfileReducer.firstname,
    lastname: state.ProfileReducer.lastname,
    email: state.ProfileReducer.email,
    bio: state.ProfileReducer.bio,
    photo: state.PhotoReducer.photo,
    qr: state.ProfileReducer.qr,
    cardID: state.ProfileReducer.cardID,
    total: state.ProfileReducer.total,
    goal: state.ProfileReducer.goal,
    bitcoinValue: state.BitcoinValueReducer.bitcoinValue
  }
}

class LandingPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      history: [],
      refreshing: false,
      wellSavings: '',
      pieData: [],
      colorScale: []
    }
    // this.getTotal = this.getTotal.bind(this)
  }

  componentWillMount() {
    firebase.database().ref(`users/${this.props.uid}`).once('value').then(data => {
      let logs = (data.val().logs) ? Object.values(data.val().logs) : [];
      let { username, firstname, lastname, email, photo, bio, wallet, cardID, total, goal, donationID } = data.val()
      this.props.setUserInfo({
        username,
        firstname,
        lastname,
        email,
        bio,
        qr: wallet,
        cardID,
        total,
        goal,
        donationID
      })
      this.props.setSavings(logs)
      this.props.setUserPhoto(photo)  
    })
    firebase.database().ref(`users/${this.props.uid}`).on('value', (snapshot) => {
      let { total, wallet, goal } = snapshot.val()
        if (wallet !== '') {
          axios.post(`http://${HOST_IP}:4000/api/getWellTotal`, {uid: this.props.uid})
          .then(({ data }) => {
            this.setState({
              wellSavings: data[0].native_balance.amount
            })
            if (this.props.total > 0) {
              this.setState({
                pieData: [
                  { x: "Well", y: (+this.state.wellSavings / goal) * 100},
                  { x: 'Wallet', y: (total / goal) * 100},
                  { x: 'Goal', y: ((goal - (total + +this.state.wellSavings)) / goal) * 100},
                ],
                colorScale: ['black', 'grey', 'darkgrey']
              })
            } else {
              this.setState({
                pieData: [
                  { x: "Well", y: (+this.state.wellSavings / goal) * 100},
                  { x: 'Goal', y: ((goal - (total + +this.state.wellSavings)) / goal) * 100},
                ],
                colorScale: ['black', 'darkgrey']
              })
            }

          })
        } else {
          this.setState({
            pieData: [
              { x: 'Wallet', y: (total / goal) * 100},
              { x: 'Goal', y: ((goal - total) / goal) * 100},
            ],
            colorScale: ['grey', 'darkgrey']
          })
        }
      })

    axios.get(`http://${HOST_IP}:80/api/getBitcoinValue`)
    .then(({ data }) => {
      this.props.setBitcoinValue(data)
    })

    axios.get('https://api.coindesk.com/v1/bpi/historical/close.json')
    .then(({ data }) => {
      console.log('bitcoin historical value', data.bpi)
      let rawData = data.bpi
      let dates = Object.keys(rawData)
      let values = Object.values(rawData)

      let final = []
      for (let i = 0; i < dates.length; i ++) {
        let obj = {}
        let date = dates[i].split('-').join('').slice(6)
        obj.x = date
        obj.y = values[i]
        final.push(obj)
      }

      this.setState({
        history: final
      })
    })

  }

  _onRefresh() {
   
    this.setState({refreshing: true});
    axios.get(`http://${HOST_IP}:80/api/getBitcoinValue`)
    .then(({ data }) => {
      this.props.setBitcoinValue(data)
    })
    // .then(() => this.setState({refreshing: false}))

    // axios.get('https://api.coindesk.com/v1/bpi/historical/close.json')
    // .then(({ data }) => {
    //   console.log('bitcoin historical value', data.bpi)
    //   let rawData = data.bpi
    //   let dates = Object.keys(rawData)
    //   let values = Object.values(rawData)

    //   let final = []
    //   for (let i = 0; i < dates.length; i ++) {
    //     let obj = {}
    //     let date = dates[i].split('-').join('').slice(6)
    //     obj.x = date
    //     obj.y = values[i]
    //     final.push(obj)
    //   }

    //   this.setState({
    //     history: final
    //   })
    // })
    this.setState({refreshing: false});
  }

  // getTotal() {
  //   let total;
  //   firebase.database().ref(`users/${this.props.uid}`).on('value', (data) => {
  //     total = data.val().total
  //   })
  //   return total;
  //   // let total = 0;
  //   // for(let i = 0; i < this.props.logs.length; i++) {
  //   //   total += Number(this.props.logs[i]['amount'])
  //   // }
  //   // return total
  // }

  render() {
    return (
      <Image source={require('../../assets/backgroundProfile.jpg')}  style={styles.backgroundImage}>      
      <View>
        <View>
        <NavigationBar title={{title:'MY WISHING WELL', tintColor:"white"}} tintColor='rgba(240, 240, 240, 0.1)'/>
        </View>
          
          <ScrollView
            refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh.bind(this)}
              />} 
          >
          <View style={styles.priceWrap}>
            <View style={styles.priceBox}>
              <Text style={styles.priceText}>1</Text>
              <Text style={styles.priceCurr}>BITCOIN</Text>
            </View>
            <View style={styles.priceBox}> 
              <Text style={styles.priceText}>{this.props.bitcoinValue}</Text>
              <Text style={styles.priceCurr}>USD</Text>
            </View>
          </View>

          <VictoryChart
            theme={VictoryTheme.material}
          >
            <VictoryLine
              data={this.state.history}
              style={{
                data: { stroke: 'black' },
                parent: { border: "1px solid #ccc"}
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 1000 }
              }}
            /> 
          </VictoryChart>

          
              <Text>Goal: {this.props.goal}</Text>
              <Text>Well Savings: ${this.state.wellSavings || 0}</Text>
              <View style={{marginBottom: '10%'}}>
                <VictoryPie data={this.state.pieData}
                colorScale={this.state.colorScale}
                innerRadius={50}
                width={350}
                />
              </View>
          </ScrollView>
      </View>
      </Image>
    )
  }
}

reactMixin(LandingPage.prototype, TimerMixin);

const styles = StyleSheet.create({
  backgroundImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0)'
  },
  priceCurr: {
    color: 'white',
    fontSize: 20,
    textAlign:'center',
    backgroundColor: 'rgba(0,0,0,0)'    
  },
  priceText: {
    color: 'white',
    fontSize: 30,
    marginTop: 45,
    textAlign:'center',
    backgroundColor: 'rgba(0,0,0,0)'
  },
  priceWrap: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 40,
    marginRight: 40,
    marginTop: 10
  },
  priceBox: {
    backgroundColor: 'rgba(250,250,250,0.5)',
    width: 150,
    height: 150,
    borderRadius: 20
  },
  date: {
    textAlign: 'left'
  },
  amount: {
    textAlign: 'right',
    marginRight: 15
  },
  bar: {
    transform: [{ rotate: '270deg'}],
    marginTop: '30%',
    marginLeft: '23%',
    marginBottom: '40%'
  }
})

export default connect(mapStateToProps, { setSavings, setUserInfo, setUserPhoto, setBitcoinValue })(LandingPage)
