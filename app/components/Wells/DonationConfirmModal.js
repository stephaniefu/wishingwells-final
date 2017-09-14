import React, { Component } from 'react';
import { Text, Button, View, StyleSheet, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { setUserInfo } from '../../Actions/Profile/ProfileAction.js';
import { connect } from 'react-redux'

class DonationConfirmModal extends Component {
  constructor(props) {
    super(props);
  }
  state = {
    visibleModal: null,
  };

  _renderButton = (text, onPress) => (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <View>
        <Text style={styles.buttonText}>Confirm</Text>
      </View>
    </TouchableOpacity>
  );

  _renderCloseButton = (text, onPress) => (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <View>
        <Text>Close</Text>
      </View>
    </TouchableOpacity>
  );

  _renderModalContent = () => (
    <View style={styles.modalContent}>
      <Text style={styles.donationModalText}>You want to donate: ${this.props.amount}?</Text>
      <Text></Text>
      <Text style={styles.donationModalText}>Description: </Text>
      <Text>{this.props.description}</Text>
      {this._renderButton('Confirm', () => {
          this.props.toggleDonateReady();
          this.setState({ visibleModal: null })
        })
      }
      {this._renderCloseButton('Close', () => this.setState({ visibleModal: null }))}
    </View>
  );

  render() {
    return (
      <View style={styles.container}>
        {this._renderButton("Add to Wallet", () => {
          (this.props.amount > 0 && this.props.description.length > 0) ? this.setState({ visibleModal: 1 }) : alert("Incorrect fields")
        })}
        <Modal isVisible={this.state.visibleModal === 1}>
          {this._renderModalContent()}
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'lightgrey',
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    height: 40,
    width: 200,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  buttonText: {
    fontSize: 20
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  donationModalText: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
});

export default connect(null, { setUserInfo })(DonationConfirmModal)
