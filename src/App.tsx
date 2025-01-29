import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {Container, Typography, CircularProgress, Box, Grid, Paper, List, ListItem, IconButton} from '@mui/material';
import { useSpring, animated } from 'react-spring';
import './App.css';
import { Telegram, BarChart } from '@mui/icons-material';

// Assuming TRENDING_SOURCES is imported from the backend.
import { TRENDING_SOURCES } from './constants';

const TRENDINGSOURCES: any = TRENDING_SOURCES;

interface Token {
  position: number;
  address: string;
  extra: any;
}

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [trendingData, setTrendingData] = useState<{ [key: string]: Token[] }>({});

  // Fetch data for each source and network pair
  const fetchData = () => {
    setLoading(true);
    const fetchPromises = Object.keys(TRENDINGSOURCES).map((key) => {
      const source: any = key;
      const network: any = TRENDINGSOURCES[key].network;

      return axios.get(`/trending?source=${source}&network=${network}`)
        .then(response => ({
          key,
          data: response.data
        }));
    });

    Promise.all(fetchPromises)
      .then(results => {
        const newTrendingData: { [key: string]: Token[] } = {};
        results.forEach(result => {
          newTrendingData[result.key] = result.data;
        });
        setTrendingData(newTrendingData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data', error);
        setLoading(false);
      });
  };

  const getChartLink = (token: string, network: string) => {
        if(network === "SOL") {
            return 'https://dexscreener.com/solana/' + token;
        } else if(network === "ETH") {
            return 'https://dexscreener.com/ethereum/' + token;
        }
    };

  useEffect(() => {
    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 60000); // Fetch every 1 minute

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  const fade = useSpring({ opacity: loading ? 0 : 1 });

  return (
    <Container>
      <Typography variant="h3" gutterBottom style={{ color: '#D8D5D5', display: 'inline-block', fontWeight: 'bold', marginBottom: '2rem' }}>
        CHUB
      </Typography>

      {loading ? (
        <CircularProgress style={{ color: '#D8D5D5' }} />
      ) : (
        <animated.div style={fade}>
          <Grid container spacing={3}>
            {Object.keys(TRENDING_SOURCES).map((key) => {
              const group = TRENDINGSOURCES[key];
              const tokens = trendingData[key] || [];

              return (
                <Grid item xs={12} sm={6} md={4} key={key}>
                  <Paper style={{ padding: '0rem', backgroundColor: 'teal', color: '#fff' }}>
                    <Typography variant="h6" gutterBottom>
                      {group.name} ({group.network}) <IconButton
                        component="a"
                        href={group.telegram} // Link to Telegram channel
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#fff', marginLeft: '0.5rem' }}
                      >
                        <Telegram />
                      </IconButton>
                    </Typography>
                    <List>
                      {tokens.length > 0 ? tokens.map((token, index) => (
                        <ListItem key={index}>
                            <span className="numbers">{token.position}</span>. {token.extra.tokenName} <IconButton
                                        component="a"
                                        href={getChartLink(token.address, TRENDINGSOURCES[key].network)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: '#fff', marginLeft: '0.5rem', padding: '0' }}
                                      >
                                <BarChart />
                              </IconButton>
                        </ListItem>
                      )) : (
                        <Typography variant="body2" style={{ color: '#ccc' }}>
                          No tokens available
                        </Typography>
                      )}
                    </List>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </animated.div>
      )}

      <Box className="footer">
        <Typography variant="body2" style={{ color: '#F0EFF4' }}>
          &copy; Trending Crypto
        </Typography>
      </Box>
    </Container>
  );
};

export default App;
