import React, { Component, useState } from "react"
import styled from "styled-components"
import { useQuery } from "urql"

import Maps from "./Maps"
import Chart from "./Chart"
import Overview from "./Overview"
import Reconcilliation from "./Reconciliation"
import { gql } from "../utils"

import "../css/App.css"

/**
 * In general, there's probably no reason to use a Class component
 * in 2019. However, if it's what you're used to, that's okay.
 *
 * Going forward, I would always recommend functional and hook based
 * components over their class counterparts. Below this component is an alternative implementation using function components and hooks.
 */
class _App extends Component {
  // Unless you need access to props, to initialize your state,
  // you don't really need a constructor() in a class component.
  // -----------------------------------------------------------
  // By using arrow functions, we can ensure a proper binding
  // of `this` inside of our instance methods as well.
  state = {
    center: {
      lat: 21.475,
      lng: -158.1
    },
    zoom: 11,
    showReconcilliation: false,
    showChart: false,
    stationData: null
  }

  // You can't call a React hook inside of a function like this, nor even use one inside of a class component. I'm pretty sure React would crash if you ran this function.
  //
  // In addition, this is improper variable usage in GraphQL. See the urql docs
  // on how to properly inject variables into GraphQL queries.
  updateStationData = location => {
    const [{ data }] = useQuery({
      query: `{chargedata(where: {station: {_eq: ${location}}}) { starttime, endtime, duration, energy, amount }}`
    }).then(this.setState(prevState => ({ stationData: data.data })))
  }

  toggleReconcilliation = () => {
    this.setState(prevState => ({
      showReconcilliation: !prevState.showReconcilliation
    }))
  }

  toggleChart = () => {
    this.setState(prevState => ({ showChart: !prevState.showChart }))
  }

  render() {
    const {
      center,
      zoom,
      showChart,
      showReconcilliation,
      stationData
    } = this.state

    // Avoid redundant comments like "Flexbox to center" when the component
    // Itself is descriptive of the functionality. This same idea applies for
    // conditional rendering as well. boolean && (<SomeComponent />) is an
    // established standard to conditionally render something and doesn't
    // need to be commented.
    //
    // The <FlexBox> component should be declarative enough with it's style
    // definitions to know what's going on.
    //
    // Also, this top level <div> is un-necessary.
    return (
      <Flexbox>
        <Overlay>
          <Maps center={center} zoom={zoom} handler={this.updateStationData} />
        </Overlay>
        <Content>
          <FlexLeft>
            <Overview
              data={stationData}
              toggleReconcile={this.toggleReconcilliation}
              toggleChart={this.toggleChart}
            />
          </FlexLeft>
          <FlexRight>
            {showReconcilliation && (
              <Reconcilliation toggle={this.toggleReconcilliation} />
            )}
            {showChart && <Chart toggle={this.toggleReconcilliation} />}
          </FlexRight>
        </Content>
      </Flexbox>
    )
  }
}

// Statically define your GraphQL outside of your component.
// The gql helper provides syntax highlighting for your queries.
const query = gql`
  query getLocationChargeData($location: String) {
    chargedata(where: { station: { _eq: $location } }) {
      starttime
      endtime
      duration
      energy
      amount
    }
  }
`

// Sample refactored hooks based component
const App = () => {
  const [state, setState] = useState({
    center: {
      lat: 21.475,
      lng: -158.1
    },
    zoom: 11,
    showReconcilliation: false,
    showChart: false,
    stationData: null,

    // Making some assumptions here about your app:
    location: "A"
  })
  const {
    center,
    zoom,
    stationData,
    showReconcilliation,
    showChart,
    location
  } = state
  // This hook and query will re-run anytime `state.location` changes automatically!
  const [response] = useQuery({
    query,
    variables: {
      location
    }
  })

  const updateStationData = newLocation => {
    setState(prevState => ({ ...prevState, location: newLocation }))
  }

  const toggleReconcilliation = () => {
    setState(prevState => ({
      ...prevState,
      showReconcilliation: !prevState.showReconcilliation
    }))
  }

  const toggleChart = () => {
    setState(prevState => ({
      ...prevState,
      showChart: !prevState.showChart
    }))
  }

  // Since we are returning, we don't need to use an else/if
  if (response.fetching) return "Loading..."
  if (response.error) return "An error occurred."

  // response.data will have all your data.
  console.log(response.data)

  return (
    <Flexbox>
      <Overlay>
        <Maps center={center} zoom={zoom} handler={updateStationData} />
      </Overlay>

      <Content>
        <FlexLeft>
          <Overview
            data={stationData}
            toggleReconcile={toggleReconcilliation}
            toggleChart={toggleChart}
          />
        </FlexLeft>

        <FlexRight>
          {showReconcilliation && (
            <Reconcilliation toggle={toggleReconcilliation} />
          )}
          {showChart && <Chart toggle={toggleReconcilliation} />}
        </FlexRight>
      </Content>
    </Flexbox>
  )
}

// <Flexbox> component uses grid??
const Flexbox = styled.div`
  // flexbox
  display: grid;
  flex-direction: row;
  width: 100%;
`

const Overlay = styled.div`
  grid-area: 1/1;
`

const Content = styled.div`
  grid-area: 1/1;
  display: flex;
  width: 100%;
`

const FlexLeft = styled.div`
  width: 300px;
  z-index: 1;
`

const FlexRight = styled.div`
  flex-grow: 1;
  z-index: 1;
`

export default App
