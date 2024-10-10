import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import SlideShowScreen from './components/screens/SlideShowScreen';
import SettingsScreen from './components/screens/SettingsScreen';
import { ROUTES } from './routes';
import { ConfigProvider, theme } from 'antd';
import MediaScreen from './components/screens/MediaScreen';


function App(): JSX.Element {
  const { darkAlgorithm } = theme;

  return (
    <ConfigProvider theme={{
      algorithm: darkAlgorithm,
      token: {
        fontSize: 22,
        lineHeight: 2,
      },
      components: {
        Button: {
          paddingBlock: 20,
        },
        Slider: {
          controlHeight: 50,
          handleSize: 20,
          handleSizeHover: 24,
          railSize: 6,
        },
        Radio: {
          fontSize: 60,
          controlHeight: 80,
          padding: 30,
        }
      }
    }}>
      <Router>
        <Routes>
          <Route path={ROUTES.HOME} element={
            <MediaScreen />
          } />
          <Route path={ROUTES.MEDIA} element={
            <MediaScreen />
          } />
          <Route path={ROUTES.SETTINGS} element={
            <SettingsScreen />
          } />
        </Routes>
      </Router>
    </ConfigProvider>

  );
}

export default App;
