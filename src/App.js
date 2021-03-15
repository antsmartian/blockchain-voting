import { useState, useEffect } from 'react'
import Contract from './component/contract'
import { Wallet, deleteWallet } from './component/contract/Wallet'

function App() {
  const [parties, setParties] = useState([])
  const [votes,setVotes] = useState({})
  const [address,setAddress] = useState('')
  const [isVoting, setIsVoting] = useState(false);
  const [txn, setTxn] = useState({
    url: "",
    state: false
  })

  const loadParties = async () => {
    let partyOne = await Contract.candidatesStore(7);
    let partyTwo = await Contract.candidatesStore(8);

    setParties([
        {
          name: partyOne.decoded.name,
          proposal: partyOne.decoded.proposal
        },
        {
          name: partyTwo.decoded.name,
          proposal: partyTwo.decoded.proposal
        }
      ])

    console.log(Wallet.address)
    setAddress(Wallet.address);

    let partyOneVote = await Contract.totalVotes(7);
    let partyTwoVote = await Contract.totalVotes(8);
    setVotes({
      partyOneVote: partyOneVote.decoded['0'],
      partyTwoVote: partyTwoVote.decoded['0']
    })

    window.contract = Contract
  }

  useEffect(() => {
    loadParties()
  }, [votes.partyTwoVote, votes.partyOneVote])

  const vote = async (index) => {
    setIsVoting(true)
    setTxn({
      state: false
    })
    if (index === 0 ) {
      const data = await Contract.addVote(address,7,1)
      setTxn({
        url :`https://explore-testnet.vechain.org/transactions/${data.txid}#info`,
        state: true
      })
      let partyOneVote = await Contract.totalVotes(7);
      setVotes({
        ...votes,
        partyOneVote: partyOneVote.decoded['0']
      })
      setIsVoting(false)
    } else {
      const data =  await Contract.addVote(address,8,1);
      setTxn({
        url :`https://explore-testnet.vechain.org/transactions/${data.txid}#info`,
        state: true
      })
      let partyTwoVote = await Contract.totalVotes(8);
      setVotes({
        ...votes,
        partyTwoVote: partyTwoVote.decoded['0']
      })
      setIsVoting(false)
    }
  }

  return (
    <div>
    <div id="app">
        <header>
            <div className="logo">
                <h1>Blockchain Election</h1>
            </div>
        </header>
        <main>
              <div className="cards">
                {parties.map((party,index) => {
                  {console.log("rendering again")}
                  return (
                    <div className="card">
                        <div className="card-info">
                            <div className="candidate-votes">
                                <span className={`votes-number-party${index+1}`}>${ index === 0 ? votes.partyOneVote : votes.partyTwoVote}</span>
                                <span className="votes-text">VOTES</span>
                            </div>
                            <div className="line"></div>
                            <div className="candidate-info">
                                <span className="candidate-name">{party.name}</span>
                                <span className="candidate-party">{party.proposal}</span>
                            </div>
                        </div>
                        <button onClick={async () => await vote(index)} className={`card-btn btn-party${index+1}`}>VOTE</button>
                    </div>
                    )
                  })}
              </div>
        </main>
        <div style={{"fontSize": "15px", "padding": "30px"}}>
          <h3>{isVoting ? "We are saving your vote into the blockchain!" : ""}</h3>
          <h3>{txn.state ? `Thank you for the vote, your vote is saved into our blockchain. To check if 
          your vote is successful, kindly see txn log after few seconds :` : ''}
            {txn.state && <a href={`${txn.url}`} target="_blank">Log</a>}
            <br />
            {txn.state && `If the txn is "reverted" either you tried to vote again (Everybody lies ha?) or my 
            sponsor delegation service is running out of gas tokens (sorry!)`}
          </h3>
        </div>

    </div>
      <div style={{"fontSize": "15px", "padding": "30px"}}>
        Readme <br/>
          What is it? <br/>
          1. It is a simple voting app, that is built on blockchain. <br/>
          2. Everytime a user first loads the page, it creates a private key
            for you. Basically user can submit 
            their own private key (if they have already). But for simplicity, I'm creating
            that for you. This private key identifies you. Imagine everyone will have only
            one key (may be based on passport/government proof etc) <br /> 
          3. You click on "vote", your private key is passed along with your 
             voted candidate to the blockchain. <br />
          4. If you are good person and voting for first time, your block will 
             be accepted by the validator nodes and saves your vote into the blockchain. <br/>
          5. If you are trying to cheat by voting again, well we caught you! Your vote won't be saved 
          in th block chain and marked as "reverted" in txn logs. <br/> 
      </div>
    </div>
  );
}

export default App;
