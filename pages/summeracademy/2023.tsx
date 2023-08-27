import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Container,
  Grid,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import NextLink from 'next/link';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LanguageIcon from '@mui/icons-material/Language';
import SchoolIcon from '@mui/icons-material/School';
import LandscapeIcon from '@mui/icons-material/Landscape';
import Image from 'next/image';
import Head from 'next/head';
import Carousel from 'react-material-ui-carousel';
import Theory from 'public/artturi-jalli-gYrYa37fAKI-unsplash.jpg';
import { useEffect } from 'react';
import anime from 'animejs';
import HeroImage from '../../public/SA-2023.jpg';
import SA23_TableImage from '../../public/SA-2023-Table.jpg';
import SA23_TableImage2 from '../../public/SA-2023-Table2.jpg';
import SA23_ColorImage from '../../public/SA-2023-Colors.jpg';
import SA23_FoppaImage from '../../public/SA-2023-Foppa.jpg';
import PanoramaAlpeFoppa from '../../public/PanoramaAlpeFoppa.jpg';
import PanoramaBottaChurch from '../../public/PanoramaBottaChurch.jpg';
import PanoramaCampusEst from '../../public/PanoramaCampusEst.jpg';
import PanoramaLuganoStazione from '../../public/PanoramaLuganoStazione.jpg';
import PanoramaMonteBoglia from '../../public/PanoramaMonteBoglia.jpg';
import PanoramaParcoCiani from '../../public/PanoramaParcoCiani.jpg';
import PanoramaPedalo from '../../public/PanoramaPedalo.jpg';
import PanoramaSanBernardino from '../../public/PanoramaSanBernardino.jpg';
import PanoramaSanSalvatore from '../../public/PanoramaSanSalvatore.jpg';
import PanoramaTamaroLemaDry from '../../public/PanoramaTamaroLemaDry.jpg';
import PanoramaTamaroLemaLugano from '../../public/PanoramaTamaroLemaLugano.jpg';
import PanoramaUSI from '../../public/PanoramaUSI.jpg';
import Art from '../../public/alp-ancel-WKQt_X-SKFI-unsplash.jpg';
import PyTamaroLogo from '../../public/PyTamaroLogo.png';
import NavigationBar from '../../components/NavigationBar';

function SILogo({ height } : { height: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 283.61 85.04"
      style={{ height }}
    >
      <title>USI SI Logo</title>
      <g id="Layer_2" data-name="Layer 2">
        <g id="Layer_1-2" data-name="Layer 1">
          <rect x="99.21" width="14.17" height="85.04" />
          <rect x="194.88" width="3.54" height="85.04" />
          <path d="M127.84,9c0,1.89-.71,3.4-3.2,3.4a2.92,2.92,0,0,1-3.2-3.23V3.6h.8V9.36a2.13,2.13,0,0,0,2.41,2.26c1.53,0,2.37-.7,2.37-2.47V3.6h.82Z" />
          <path d="M133.39,12.15v-3a4.81,4.81,0,0,0-.13-1.57,1.21,1.21,0,0,0-1.2-.68,1.71,1.71,0,0,0-1.73,1.95v3.3h-.72V6.38h.72v1a1.75,1.75,0,0,1,1.81-1.16,1.8,1.8,0,0,1,1.76,1,3.67,3.67,0,0,1,.21,1.62v3.28Z" />
          <path d="M135.8,5V3.92h.7V5Zm0,7.13V6.38h.7v5.77Z" />
          <path d="M142.32,6.38l-2.22,5.77h-.58l-2-5.77h.71l1.6,4.7,1.78-4.7Z" />
          <path d="M143.59,9.44a2,2,0,0,0,1.93,2.2,1.93,1.93,0,0,0,1.88-1.21l.67.2a2.59,2.59,0,0,1-2.51,1.67,2.78,2.78,0,0,1-2.76-3.09,2.65,2.65,0,1,1,5.27-.05v.11h-4.48Zm3.65-.76a1.78,1.78,0,0,0-1.79-1.81,1.87,1.87,0,0,0-1.85,1.81Z" />
          <path d="M150.14,6.38V7.3a1.63,1.63,0,0,1,1.58-1,3.49,3.49,0,0,1,.5,0V7a2.25,2.25,0,0,0-.46,0c-1.24,0-1.62.91-1.62,2.07v3.16h-.72V6.38Z" />
          <path d="M153.4,10.51A1.57,1.57,0,0,0,155,11.64c1.12,0,1.48-.61,1.48-1.12s-.29-.84-1.24-1l-.68-.15c-.9-.19-1.51-.59-1.51-1.44a1.57,1.57,0,0,1,.5-1.17,2.44,2.44,0,0,1,1.58-.49,2.52,2.52,0,0,1,1.41.38,1.57,1.57,0,0,1,.63.93l-.68.18c-.13-.67-.82-.86-1.4-.86-1.18,0-1.33.62-1.33,1,0,.68.71.84,1.21.93l.6.12c1,.21,1.6.79,1.6,1.69,0,.66-.53,1.73-2.15,1.73a2.35,2.35,0,0,1-2.33-1.55Z" />
          <path d="M158.6,5V3.92h.7V5Zm0,7.13V6.38h.7v5.77Z" />
          <path d="M162.24,10.93c0,.33,0,.7.48.7a1.44,1.44,0,0,0,.79-.36V12a1.54,1.54,0,0,1-.95.26.88.88,0,0,1-.92-.52,3.29,3.29,0,0,1-.09-.94V7h-1.21v-.6h1.21V3.92h.69V6.38h1.27V7h-1.27Z" />
          <path d="M169.62,12.15c-1,0-1.41-.24-1.41-1.05a2.05,2.05,0,0,1-2.05,1.17,1.6,1.6,0,0,1-1.81-1.57c0-1.15,1-1.56,2.89-2l1-.22V8c0-.56-.28-1.18-1.34-1.18s-1.56.46-1.56,1.39l-.79-.13a2.05,2.05,0,0,1,2.26-1.89c1,0,2.12.3,2.12,1.75v2.53c0,.77,0,1.07.74,1.07h.12v.57ZM167,5.4l-2.08-1.7h1.35l1.37,1.7Zm1.22,3.7-.36.1c-2,.52-2.81.64-2.81,1.49,0,.4.31,1,1.16,1a2.13,2.13,0,0,0,1.86-1.09,2.39,2.39,0,0,0,.15-1Z" />
          <path d="M125.17,25.26v-1a1.82,1.82,0,0,1-1.78,1.18c-1.44,0-2.39-1.31-2.39-3s1-3,2.5-3a1.69,1.69,0,0,1,1.67,1v-3.7h.7v8.55Zm-1.67-.54c.93,0,1.68-.65,1.68-2.24v-.32c0-1.91-1.07-2.14-1.64-2.14-1.09,0-1.76.92-1.76,2.35C121.78,24.08,122.6,24.72,123.5,24.72Z" />
          <path d="M128,22.55A2,2,0,0,0,130,24.76a1.93,1.93,0,0,0,1.88-1.22l.67.2A2.58,2.58,0,0,1,130,25.41a2.78,2.78,0,0,1-2.76-3.09,2.65,2.65,0,1,1,5.27-.05v.11H128Zm3.65-.76A1.77,1.77,0,0,0,129.89,20,1.87,1.87,0,0,0,128,21.79Z" />
          <path d="M133.85,25.26V16.71h.73v8.55Z" />
          <path d="M136.25,25.26V16.71H137v8.55Z" />
          <path d="M143.59,25.26c-1,0-1.41-.24-1.41-1.05a2.06,2.06,0,0,1-2.05,1.18,1.6,1.6,0,0,1-1.81-1.58c0-1.15,1-1.56,2.89-2l1-.21v-.45c0-.56-.28-1.18-1.34-1.18s-1.57.46-1.57,1.4l-.78-.14a2.05,2.05,0,0,1,2.26-1.89c1,0,2.12.31,2.12,1.75v2.53c0,.77,0,1.08.74,1.08h.12v.56Zm-1.41-3.05-.36.1c-2,.52-2.81.64-2.81,1.49a1,1,0,0,0,1.16,1A2.12,2.12,0,0,0,142,23.67a2.28,2.28,0,0,0,.16-1Z" />
          <path d="M126.52,31.89a2.54,2.54,0,0,0-.36-.74,2.18,2.18,0,0,0-1.86-.87c-1.48,0-2,.81-2,1.52,0,1.1,1,1.38,1.82,1.6l.82.22c1.54.41,2.51,1.08,2.51,2.42a2.37,2.37,0,0,1-1.06,2,3.48,3.48,0,0,1-2.13.6,2.89,2.89,0,0,1-3.18-2.37l.81-.42a2.13,2.13,0,0,0,.19,1,2.18,2.18,0,0,0,2.18,1.13c1.57,0,2.36-.85,2.36-1.82s-.6-1.39-1.81-1.7l-1-.26c-1-.25-2.31-.7-2.31-2.27,0-1.19.87-2.22,2.82-2.22a2.86,2.86,0,0,1,3,1.88Z" />
          <path d="M132.57,32.6l-2.22,5.78h-.58l-2-5.78h.72l1.6,4.7,1.78-4.7Z" />
          <path d="M133.6,31.24v-1.1h.7v1.1Zm0,7.14V32.6h.7v5.78Z" />
          <path d="M135.42,38.38v-.45l3.13-4.71h-2.86V32.6h3.86V33l-3.12,4.71h3.21v.65Z" />
          <path d="M140.41,38.38v-.45l3.13-4.71h-2.86V32.6h3.86V33l-3.12,4.71h3.21v.65Z" />
          <path d="M146,35.66A2,2,0,0,0,148,37.87a1.93,1.93,0,0,0,1.87-1.21l.67.19A2.58,2.58,0,0,1,148,38.52a2.78,2.78,0,0,1-2.76-3.09,2.65,2.65,0,1,1,5.27,0v.1H146Zm3.66-.76a1.77,1.77,0,0,0-1.8-1.8A1.87,1.87,0,0,0,146,34.9Z" />
          <path d="M152.57,32.6v.92a1.63,1.63,0,0,1,1.59-1,3.36,3.36,0,0,1,.49,0v.64a3.23,3.23,0,0,0-.46,0c-1.23,0-1.62.9-1.62,2.07v3.16h-.72V32.6Z" />
          <path d="M160.48,38.38c-1,0-1.41-.24-1.41-1.06a2.06,2.06,0,0,1-2,1.18,1.6,1.6,0,0,1-1.81-1.58c0-1.15,1-1.56,2.89-2l1-.22v-.45c0-.56-.28-1.18-1.34-1.18s-1.57.46-1.57,1.4l-.78-.14a2.05,2.05,0,0,1,2.26-1.89c1,0,2.12.31,2.12,1.75v2.53c0,.77,0,1.08.74,1.08h.12v.57Zm-1.41-3.05-.36.09c-2,.52-2.81.64-2.81,1.49a1,1,0,0,0,1.16,1,2.12,2.12,0,0,0,1.85-1.09,2.26,2.26,0,0,0,.16-1Z" />
          <path d="M121.38,44.36V43.25h.7v1.11Zm0,7.13V45.71h.7v5.78Z" />
          <path d="M125,50.27c0,.32,0,.7.48.7a1.58,1.58,0,0,0,.8-.36v.72a1.56,1.56,0,0,1-1,.27.88.88,0,0,1-.92-.52,3.78,3.78,0,0,1-.09-.95V46.32h-1.21v-.61h1.21V43.25H125v2.46h1.28v.61H125Z" />
          <path d="M132.4,51.49c-1,0-1.41-.24-1.41-1.05a2,2,0,0,1-2,1.17A1.61,1.61,0,0,1,127.13,50c0-1.15,1-1.57,2.9-2l1-.22v-.45c0-.56-.27-1.17-1.34-1.17s-1.56.46-1.56,1.39l-.79-.13a2.05,2.05,0,0,1,2.27-1.89c1,0,2.11.3,2.11,1.74v2.53c0,.78,0,1.08.74,1.08h.12v.57ZM131,48.44l-.36.09c-2,.52-2.81.65-2.81,1.49A1,1,0,0,0,129,51a2.11,2.11,0,0,0,1.86-1.09,2.26,2.26,0,0,0,.15-1Z" />
          <path d="M133.54,51.49V42.94h.72v8.55Z" />
          <path d="M135.92,44.36V43.25h.7v1.11Zm0,7.13V45.71h.7v5.78Z" />
          <path d="M143.25,51.49c-1,0-1.41-.24-1.41-1.05a2,2,0,0,1-2,1.17A1.61,1.61,0,0,1,138,50c0-1.15,1-1.57,2.89-2l1-.22v-.45c0-.56-.28-1.17-1.34-1.17s-1.56.46-1.56,1.39l-.79-.13a2,2,0,0,1,2.26-1.89c1,0,2.12.3,2.12,1.74v2.53c0,.78,0,1.08.74,1.08h.12v.57Zm-1.41-3.05-.36.09c-2,.52-2.81.65-2.81,1.49a1,1,0,0,0,1.16,1,2.13,2.13,0,0,0,1.86-1.09,2.41,2.41,0,0,0,.15-1Z" />
          <path d="M148.17,51.49v-3a4.88,4.88,0,0,0-.13-1.58,1.21,1.21,0,0,0-1.2-.68,1.72,1.72,0,0,0-1.73,2v3.31h-.71V45.71h.71v1a1.75,1.75,0,0,1,1.82-1.15,1.78,1.78,0,0,1,1.75,1,3.6,3.6,0,0,1,.21,1.63v3.28Z" />
          <path d="M155.49,51.49c-1,0-1.41-.24-1.41-1.05a2,2,0,0,1-2,1.17A1.61,1.61,0,0,1,150.22,50c0-1.15,1-1.57,2.89-2l1-.22v-.45c0-.56-.28-1.17-1.34-1.17s-1.56.46-1.56,1.39l-.79-.13a2,2,0,0,1,2.26-1.89c1,0,2.12.3,2.12,1.74v2.53c0,.78,0,1.08.74,1.08h.12v.57Zm-1.41-3.05-.36.09c-2,.52-2.81.65-2.81,1.49a1,1,0,0,0,1.16,1,2.12,2.12,0,0,0,1.86-1.09,2.41,2.41,0,0,0,.15-1Z" />
          <line className="cls-1" x1="283.46" x2="283.46" y2="85.04" />
          <path d="M212.12,6.08a2.48,2.48,0,0,0-2.23-1.28c-.36,0-1.6.14-1.6,1,0,.67.66.83,1.57,1l.89.2c1.35.29,2.78.81,2.78,2.53,0,2.12-2.11,2.76-3.64,2.76a4.18,4.18,0,0,1-3.74-1.83l1.34-.93a2.94,2.94,0,0,0,2.66,1.28c.93,0,1.64-.39,1.64-1.12s-.56-.87-1.64-1.11l-1.09-.24c-1.09-.24-2.45-.7-2.45-2.37s1.22-2.67,3.38-2.67a4.05,4.05,0,0,1,3.45,1.73Z" />
          <path d="M217.47,12.31a3.08,3.08,0,0,1-3.15-3.23,3.12,3.12,0,1,1,6.23,0A3,3,0,0,1,217.47,12.31Zm0-1.33A1.63,1.63,0,0,0,219,9.15,1.74,1.74,0,0,0,217.4,7.2c-.85,0-1.56.62-1.56,1.84A1.72,1.72,0,0,0,217.47,11Z" />
          <path d="M223.32,7.1v5h-1.45v-5H221v-1h.91V5.24c0-1,.31-1.67,1.94-1.67a5.79,5.79,0,0,1,.83.06V4.86a3.52,3.52,0,0,0-.46,0c-.84,0-.86.46-.86.83v.42h1.32v1Z" />
          <path d="M224.7,6.08h.88V3.92H227V6.08h1.29v1H227v3a1,1,0,0,0,.14.64.81.81,0,0,0,.55.18,2.35,2.35,0,0,0,.6-.07v1.22a5.83,5.83,0,0,1-1,.1c-1.3,0-1.71-.47-1.71-1.47V7.1h-.88Z" />
          <path d="M235.48,12.13H234l-1.09-3.86-1.15,3.86h-1.44L228.6,6.08h1.51l1,4.14,1.13-4.14h1.3l1.11,4.14,1.08-4.14h1.51Z" />
          <path d="M241.76,12.13l0-.47a3,3,0,0,1-1.78.62,2,2,0,0,1-2.2-1.86c0-1.32,1-1.84,2.16-2a14.49,14.49,0,0,0,1.86-.45c0-.46-.13-.91-1-.91-1.1,0-1.23.59-1.23.91L238,7.84c0-.4.11-1.95,2.65-1.95,1.78,0,2.54.66,2.54,1.72v3.54a1.42,1.42,0,0,0,.27,1Zm0-3a3.66,3.66,0,0,1-1.15.33c-.67.1-1.33.23-1.33.84,0,.4.26.74,1,.74s1.49-.34,1.49-1.1Z" />
          <path d="M246.12,6.08v.86a1.93,1.93,0,0,1,1.8-1H248V7.43a1.74,1.74,0,0,0-1.81,1.12,3,3,0,0,0-.11,1v2.59h-1.41V6.08Z" />
          <path d="M250.12,9.39a1.65,1.65,0,0,0,1.71,1.51,1.75,1.75,0,0,0,1.59-.84l1.23.71a3.51,3.51,0,0,1-3,1.54,3,3,0,0,1-3.11-3.24,2.93,2.93,0,0,1,3-3.18c2.31,0,3,1.86,3,3.5ZM253,8.33a1.31,1.31,0,0,0-1.36-1.27,1.46,1.46,0,0,0-1.48,1.27Z" />
          <path d="M206.84,25.24V16.69h1.58v8.55Z" />
          <path d="M211.54,19.19v.71a2.35,2.35,0,0,1,1.86-.9,1.84,1.84,0,0,1,2,2v4.21h-1.42v-3.4c0-.67-.17-1.42-1.07-1.42a1.16,1.16,0,0,0-.76.28c-.44.36-.57.87-.57,1.91v2.63h-1.47v-6Z" />
          <path d="M220.73,21.09a1.75,1.75,0,0,0-1.65-.92c-.28,0-1,.08-1,.63,0,.4.36.52,1.23.68l1,.18a1.73,1.73,0,0,1,1.63,1.69c0,1.12-1.06,2.07-2.73,2.07a3.89,3.89,0,0,1-2.91-1.09l1.09-.88a2.09,2.09,0,0,0,1.75.78c.87,0,1.18-.45,1.18-.72s-.33-.48-.89-.58l-.75-.13c-.47-.09-2.11-.39-2.11-1.82,0-1.2,1.15-2,2.61-2a3.4,3.4,0,0,1,2.6,1.13Z" />
          <path d="M222.28,19.19h.88V17h1.45v2.16h1.3v1h-1.3v3a1,1,0,0,0,.15.64.8.8,0,0,0,.55.18,2.35,2.35,0,0,0,.6-.07v1.22a5.83,5.83,0,0,1-1,.1c-1.3,0-1.71-.47-1.71-1.47v-3.6h-.88Z" />
          <path d="M226.71,18.24V16.78h1.44v1.46Zm0,7v-6h1.44v6Z" />
          <path d="M228.9,19.19h.88V17h1.46v2.16h1.29v1h-1.29v3a1,1,0,0,0,.14.64.81.81,0,0,0,.55.18,2.35,2.35,0,0,0,.6-.07v1.22a5.83,5.83,0,0,1-1,.1c-1.29,0-1.71-.47-1.71-1.47v-3.6h-.88Z" />
          <path d="M237.35,25.24v-.62a2.75,2.75,0,0,1-2,.77,1.93,1.93,0,0,1-1.74-.8,2.72,2.72,0,0,1-.36-1.6v-3.8h1.47v3.49c0,.58.15,1.34,1.19,1.34a1.29,1.29,0,0,0,1.17-.68,3.26,3.26,0,0,0,.23-1.45v-2.7h1.45v6Z" />
          <path d="M239.55,19.19h.89V17h1.45v2.16h1.3v1h-1.3v3a.94.94,0,0,0,.15.64.79.79,0,0,0,.54.18,2.37,2.37,0,0,0,.61-.07v1.22a6.06,6.06,0,0,1-1,.1c-1.3,0-1.71-.47-1.71-1.47v-3.6h-.89Z" />
          <path d="M245.15,22.51a1.64,1.64,0,0,0,1.71,1.5,1.73,1.73,0,0,0,1.58-.84l1.24.72a3.55,3.55,0,0,1-3,1.53,3,3,0,0,1-3.11-3.24,2.93,2.93,0,0,1,3-3.18c2.31,0,3,1.86,3,3.51ZM248,21.44a1.31,1.31,0,0,0-1.36-1.27,1.44,1.44,0,0,0-1.47,1.27Z" />
          <path d="M74.88,40.12l-2.72-3.87c.91-.59,3.73-2.43,3.73-7.62A7,7,0,0,0,75.47,26a2.94,2.94,0,0,0-2.82-2.09,2.51,2.51,0,0,0-2.44,1.84,18.45,18.45,0,0,0-.76,2.86l-.63,2.95a22.05,22.05,0,0,1-.87,3.1,6.26,6.26,0,0,1-6,4.14c-4.66,0-7.65-3.93-7.65-9.71a11.5,11.5,0,0,1,5-9.88L62.07,23a7.13,7.13,0,0,0-3.65,6.37c0,2.47,1.11,4.63,3,4.63,2.09,0,2.5-2.3,2.92-4.53l.56-2.54c.7-3.3,2-8,7.31-8,5.63,0,7.9,5.22,7.9,10.44a16.42,16.42,0,0,1-.56,4.39,11.1,11.1,0,0,1-4.66,6.37m2-22.66h-22V12.94H73.05a42.51,42.51,0,1,0-61,59.23,9.5,9.5,0,0,1-1.28-2.63c-.43-1.49-.43-2.55-.48-6.77V42.56h6.34V63.39a11.75,11.75,0,0,0,.43,4.13c1.3,3.27,4.85,3.65,6.86,3.65a8.28,8.28,0,0,0,5.43-1.68c1.87-1.68,1.87-3.6,1.87-6.43V42.56h6.39V63.92c0,3.84,0,7-3.65,10.08s-7.92,3.31-10.23,3.31a18.09,18.09,0,0,1-6-.91,12.61,12.61,0,0,1-2.16-1,42.52,42.52,0,0,0,61.28-58" />
        </g>
      </g>
    </svg>
  );
}

export default function SummerAcademy() {
  useEffect(() => {
    const tl = anime.timeline({
      easing: 'easeOutQuad',
      duration: 750,
      direction: 'alternate',
      loop: true,
    });
    tl.add({
      targets: '.eye-top',
      translateX: '15vw',
      translateY: '2vw',
      delay: 1000,
    });
    tl.add({
      targets: '.eye-bottom',
      translateX: '-15vw',
      translateY: '-2vw',
      endDelay: 1000,
    });
    tl.add({
      targets: '.dot-top',
      translateX: '20vw',
    });
    tl.add({
      targets: '.dot-bottom',
      translateX: '-20vw',
      endDelay: 1000,
    });
    tl.add({
      targets: '.semicircle-right',
      translateX: '5vw',
    });
    tl.add({
      targets: '.semicircle-left',
      translateX: '-5vw',
      endDelay: 1000,
    }, '-=750');
    tl.add({
      targets: '.semicircle-right',
      rotate: -90,
    });
    tl.add({
      targets: '.semicircle-left',
      rotate: 90,
      endDelay: 1000,
    });
  }, []);
  return (
    <div>
      <Head>
        <title>PyTamaro Summer Academy 2023</title>
      </Head>
      <Box>
        <NavigationBar>
          <Typography variant="h6">PyTamaro Summer Academy 2023</Typography>
        </NavigationBar>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Image
            src={HeroImage}
            alt="Photo of Alpe Foppa"
            width="2048"
            height="576"
            sizes="100vw"
            style={{
              width: '100%',
              height: 'auto',
            }}
          />
        </div>
        <Box
          sx={{
            minHeight: '8vw',
            position: 'relative',
            my: 2,
          }}
        >
          <div
            className="yin-yang-animation semicircle-left"
            style={{
              height: '8vw', width: '4vw', backgroundColor: 'white', left: 'calc(50% - 4vw)', zIndex: 2, borderRadius: '4vw 0 0 4vw',
            }}
          />
          <div
            className="yin-yang-animation semicircle-right"
            style={{
              height: '8vw', width: '4vw', backgroundColor: 'black', left: 'calc(50%)', zIndex: 2, borderRadius: '0 4vw 4vw 0',
            }}
          />
          <div
            className="yin-yang-animation eye-top"
            style={{
              height: '4vw', width: '4vw', backgroundColor: 'white', left: 'calc(50% - 2vw)', zIndex: 3, borderRadius: '50%',
            }}
          />
          <div
            className="yin-yang-animation eye-bottom"
            style={{
              height: '4vw', width: '4vw', backgroundColor: 'black', left: 'calc(50% - 2vw)', top: '4vw', zIndex: 3, borderRadius: '50%',
            }}
          />
          <div
            className="yin-yang-animation eye-top dot-top"
            style={{
              height: '1vw', width: '1vw', backgroundColor: 'black', left: 'calc(50% - .5vw)', top: '1.5vw', zIndex: 4, borderRadius: '50%',
            }}
          />
          <div
            className="yin-yang-animation eye-bottom dot-bottom"
            style={{
              height: '1vw', width: '1vw', backgroundColor: 'white', left: 'calc(50% - .5vw)', top: '5.5vw', zIndex: 4, borderRadius: '50%',
            }}
          />
        </Box>
        <Container maxWidth="lg">
          <Card>
            <CardMedia>
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <Image
                  key={10}
                  src={PanoramaUSI}
                  alt="Photo of USI"
                  width="1280"
                  height="285"
                  sizes="100vw"
                  style={{
                    width: '100%',
                    height: 'auto',
                  }}
                />
              </div>
            </CardMedia>
            <Container maxWidth="lg">
              <Typography variant="h4" align="center" marginY={3}>Five-Day Summer Academy at the Software Institute at USI in Lugano</Typography>
            </Container>
            <CardHeader
              title="Monday, August 14 to Friday, August 18, 2023"
              subheader="Daily Schedule: 9:00 to 17:00, lunch included"
              titleTypographyProps={{ align: 'center' }}
              subheaderTypographyProps={{
                align: 'center',
              }}
            />
            <CardContent>
              <Typography variant="h5" align="center" marginY={3} sx={{ fontWeight: 'bold' }}>
                The PyTamaro Summer Academy 2023 is History!
              </Typography>
              <Grid container spacing={1} alignItems="flex-end">
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={3}
                >
                  <Image
                    src={SA23_TableImage}
                    alt="Photo of Table"
                    width="1261"
                    height="831"
                    sizes="100vw"
                    style={{
                      width: '100%',
                      height: 'auto',
                    }}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={3}
                >
                  <Image
                    src={SA23_ColorImage}
                    alt="Photo of Table"
                    width="1261"
                    height="831"
                    sizes="100vw"
                    style={{
                      width: '100%',
                      height: 'auto',
                    }}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={3}
                >
                  <Image
                    src={SA23_FoppaImage}
                    alt="Photo of Table2"
                    width="1261"
                    height="825"
                    sizes="100vw"
                    style={{
                      width: '100%',
                      height: 'auto',
                    }}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={3}
                >
                  <Image
                    src={SA23_TableImage2}
                    alt="Photo of Table2"
                    width="1261"
                    height="825"
                    sizes="100vw"
                    style={{
                      width: '100%',
                      height: 'auto',
                    }}
                  />
                </Grid>
              </Grid>
              <Typography variant="h5" align="center" marginY={3} sx={{ fontWeight: 'bold' }}>
                We had a wonderful time working with fantastic students and teachers!
              </Typography>
              <Typography align="center" marginY={3}>
                It was so much fun, we simply have to organize
                {' '}
                <Link component={NextLink} href="2024">PyTamaro Summer Academy 2024</Link>
                !
              </Typography>
            </CardContent>
          </Card>
        </Container>
        <Container maxWidth="lg" sx={{ marginTop: '25px' }}>
          <List>
            <ListItem>
              <ListItemIcon>
                <AccountTreeIcon fontSize="large" color="primary" />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{ sx: { fontSize: 24 } }}
                primary="Problem Solving"
                secondaryTypographyProps={{ sx: { fontSize: 20 } }}
                secondary="Learn programming by decomposing graphics and recomposing them as programs."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <TipsAndUpdatesIcon fontSize="large" color="primary" />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{ sx: { fontSize: 24 } }}
                primary="Theory & Creativity"
                secondaryTypographyProps={{ sx: { fontSize: 20 } }}
                secondary="Experience the sound theoretical foundations of programming combined with the unbounded creativity and playfulness of computer graphics."
              />
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Image width="32" alt="PyTamaro Logo" src={PyTamaroLogo} />
              </ListItemAvatar>
              <ListItemText
                primaryTypographyProps={{ sx: { fontSize: 24 } }}
                primary="Python & PyTamaro"
                secondaryTypographyProps={{ sx: { fontSize: 20 } }}
                secondary="Use the most prevalent programming language, Python, and the greatest (we think) educational graphics library, PyTamaro."
              />
            </ListItem>
          </List>
        </Container>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            margin: '1rem 0',
          }}
        />

        <Container maxWidth="lg" component="main">
          <Grid container spacing={5} alignItems="flex-end">
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
            >
              <Card>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <LanguageIcon color="primary" sx={{ fontSize: 80 }} />
                </Box>
                <CardHeader
                  title="Multilingual"
                  subheader="Deutsch ∙ Italiano ∙ English"
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{
                    align: 'center',
                  }}
                />
                <CardContent>
                  <Typography
                    component="p"
                    variant="subtitle1"
                  >
                    The PyTamaro library currently supports German, Italian, and English.
                    In this summer academy we spoke them all.
                    Participants learned to program in their native language!
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid
              item
              xs={12}
              sm={6}
              md={4}
            >
              <Card>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <SchoolIcon color="primary" sx={{ fontSize: 80 }} />
                </Box>
                <CardHeader
                  title="Teachers &amp; Students"
                  subheader="Learn Together"
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{
                    align: 'center',
                  }}
                />
                <CardContent>
                  <Typography
                    component="p"
                    variant="subtitle1"
                  >
                    Programming is a collaborative activity.
                    Teachers and students teamed up
                    to solve a challenges and learn with and from each other.
                    From 12 to 60 years, we had it all!
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid
              item
              xs={12}
              sm={6}
              md={4}
            >
              <Card>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <LandscapeIcon color="primary" sx={{ fontSize: 80 }} />
                </Box>
                <CardHeader
                  title="Learning and Fun"
                  subheader="Minds that Match our Mountains"
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{
                    align: 'center',
                  }}
                />
                <CardContent>
                  <Typography
                    component="p"
                    variant="subtitle1"
                  >
                    The summer academy took place at USI in Lugano,
                    but we also explored the beautiful surroundings.
                    Yes, we discovered PyTamaro. But also Monte Tamaro!
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

          </Grid>
        </Container>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            margin: '1rem 0',
          }}
        />

        <Container maxWidth="lg" component="main">
          <Typography variant="h4" align="center" marginY={3}>Programming: Deep like Mathematics, Creative like Art</Typography>
        </Container>

        <Container maxWidth="lg" component="main">
          <Grid container spacing={5} alignItems="flex-end">
            <Grid
              item
              xs={12}
              sm={6}
            >
              <Card>
                <CardMedia>
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <Image
                      src={Theory}
                      alt="Photo by Artturi Jalli on Unsplash"
                      sizes="100vw"
                      style={{
                        width: '100%',
                        height: 'auto',
                      }}
                    />
                  </div>
                </CardMedia>
                <CardHeader
                  title="Theoretical Foundations"
                  subheader="Connect to Algebra and Logic"
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{
                    align: 'center',
                  }}
                />
                <CardContent>
                  <Typography
                    component="p"
                    variant="subtitle1"
                  >
                    The contents is informed by concepts from algebra
                    you might know from middle school,
                    all the way to abstract algebra and logic one would learn at university.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid
              item
              xs={12}
              sm={6}
            >
              <Card>
                <CardMedia>
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <Image
                      src={Art}
                      alt="Photo by Alp Ancel on Unsplash"
                      sizes="100vw"
                      style={{
                        width: '100%',
                        height: 'auto',
                      }}
                    />
                  </div>
                </CardMedia>
                <CardHeader
                  title="Creativity &amp; Playfulness"
                  subheader="(De)Compose Art, Design, and Games"
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{
                    align: 'center',
                  }}
                />
                <CardContent>
                  <Typography
                    component="p"
                    variant="subtitle1"
                  >
                    Starting with the composition of simple geometric shapes,
                    we will end up composing graphics inspired by contemporary art,
                    design, and game design.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            margin: '1rem 0',
          }}
        />

        <Container maxWidth="lg" component="main">
          <Typography variant="h4" align="center" marginY={3}>Organizers</Typography>
        </Container>
        <Container maxWidth="lg">
          <Typography align="center" marginY={3}>
            The 2023 PyTamaro Summer Academy was brought to you by
            the&nbsp;
            <a href="https://luce.si.usi.ch/">Lugano Computing Education Research Lab</a>
            &nbsp;at the&nbsp;
            <a href="https://si.usi.ch/">Software Institute</a>
            &nbsp;of&nbsp;
            <a href="https://www.usi.ch/">USI</a>
            .
          </Typography>
        </Container>

        <Container maxWidth="lg" component="main">
          <Grid container spacing={5} alignItems="flex-end">

            <Grid
              item
              xs={12}
              sm={4}
            >
              <Card>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    margin: '1rem 0',
                  }}
                >
                  <Avatar
                    src="../people/AgneseZamboni.jpg"
                    sx={{ width: 80, height: 80 }}
                  />
                </Box>
                <CardHeader
                  title="Agnese Zamboni"
                  subheader="Student of Informatics"
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{
                    align: 'center',
                  }}
                />
                <CardContent>
                  <Typography
                    component="p"
                    variant="subtitle1"
                  >
                    Agnese is studying informatics at USI, and she is
                    contributing to PyTamaro funded by an USI Didactics Innovation grant.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid
              item
              xs={12}
              sm={4}
            >
              <Card>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    margin: '1rem 0',
                  }}
                >
                  <Avatar
                    src="../people/LucaChiodini.jpg"
                    sx={{ width: 80, height: 80 }}
                  />
                </Box>
                <CardHeader
                  title="Luca Chiodini"
                  subheader="PhD Student of Informatics"
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{
                    align: 'center',
                  }}
                />
                <CardContent>
                  <Typography
                    component="p"
                    variant="subtitle1"
                  >
                    Luca is leading the PyTamaro effort
                    with the goal of making programming education
                    interesting and effective at the same time.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid
              item
              xs={12}
              sm={4}
            >
              <Card>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    margin: '1rem 0',
                  }}
                >
                  <Avatar
                    src="../people/MatthiasHauswirth.jpg"
                    sx={{ width: 80, height: 80 }}
                  />
                </Box>
                <CardHeader
                  title="Matthias Hauswirth"
                  subheader="Professor of Informatics"
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{
                    align: 'center',
                  }}
                />
                <CardContent>
                  <Typography
                    component="p"
                    variant="subtitle1"
                  >
                    Matthias has been teaching programming,
                    at university and for teacher training,
                    for a quarter of a century, and he still loves it.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid
              item
              xs={12}
              sm={4}
            >
              <Card>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    margin: '1rem 0',
                  }}
                >
                  <Avatar
                    src="../people/CostanzaRodriguezGavazzi.jpg"
                    sx={{ width: 80, height: 80 }}
                  />
                </Box>
                <CardHeader
                  title="Costanza Rodriguez Gavazzi"
                  subheader="Student of Informatics"
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{
                    align: 'center',
                  }}
                />
                <CardContent>
                  <Typography
                    component="p"
                    variant="subtitle1"
                  >
                    Costanza is studying informatics at USI,
                    and she is assisting in the PyTamaro Summer Academy
                    to help you learn programming.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid
              item
              xs={12}
              sm={4}
            >
              <Card>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    margin: '1rem 0',
                  }}
                >
                  <Avatar
                    src="../people/DavideFrova.jpg"
                    sx={{ width: 80, height: 80 }}
                  />
                </Box>
                <CardHeader
                  title="Davide Frova"
                  subheader="Student of Informatics"
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{
                    align: 'center',
                  }}
                />
                <CardContent>
                  <Typography
                    component="p"
                    variant="subtitle1"
                  >
                    Davide is studying informatics at USI.
                    He is passionate about robotics,
                    where code meets the real world, &amp; having fun together.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid
              item
              xs={12}
              sm={4}
            >
              <Card>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    margin: '1rem 0',
                  }}
                >
                  <SILogo height={80} />
                </Box>
                <CardHeader
                  title="Software Institute"
                  subheader="Award-Winning Teaching &amp; Research"
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{
                    align: 'center',
                  }}
                />
                <CardContent>
                  <Typography
                    component="p"
                    variant="subtitle1"
                  >
                    At the Software Institute at USI
                    we discover, design, and develop new ideas
                    that ease the conception of modern software systems.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

          </Grid>
        </Container>

        <Container maxWidth="lg" component="main">
          <Typography variant="h4" align="center" marginY={3}>Location</Typography>
        </Container>

        <Container maxWidth="lg">
          <p>
            The PyTamaro Summer Academy took place at USI,
            the Università della Svizzera italiana,
            in beautiful Lugano.
            The USI Campus is within walking distance from the lake and the city center.
            There are trains, cable cars, and gondolas up many of the nearby mountains,
            several of them easily reachable on foot or by public transportation.
          </p>
          <Carousel>
            <Image
              key={0}
              src={PanoramaLuganoStazione}
              alt="Photo of Lugano Station"
              width="1280"
              height="285"
              sizes="100vw"
              style={{
                width: '100%',
                height: 'auto',
              }}
            />
            <Image
              key={1}
              src={PanoramaAlpeFoppa}
              alt="Photo of Alpe Foppa"
              width="1280"
              height="285"
              sizes="100vw"
              style={{
                width: '100%',
                height: 'auto',
              }}
            />
            <Image
              key={1.5}
              src={PanoramaCampusEst}
              alt="Photo of USI Campus Est"
              width="1280"
              height="285"
              sizes="100vw"
              style={{
                width: '100%',
                height: 'auto',
              }}
            />
            <Image
              key={2}
              src={PanoramaBottaChurch}
              alt="Photo of Mario Botta Church"
              width="1280"
              height="285"
              sizes="100vw"
              style={{
                width: '100%',
                height: 'auto',
              }}
            />
            <Image
              key={3}
              src={PanoramaMonteBoglia}
              alt="Photo of Monte Boglia"
              width="1280"
              height="285"
              sizes="100vw"
              style={{
                width: '100%',
                height: 'auto',
              }}
            />
            <Image
              key={4}
              src={PanoramaParcoCiani}
              alt="Photo of Parco Ciani"
              width="1280"
              height="285"
              sizes="100vw"
              style={{
                width: '100%',
                height: 'auto',
              }}
            />
            <Image
              key={5}
              src={PanoramaPedalo}
              alt="Photo of Lugano"
              width="1280"
              height="285"
              sizes="100vw"
              style={{
                width: '100%',
                height: 'auto',
              }}
            />
            <Image
              key={6}
              src={PanoramaSanBernardino}
              alt="Photo of San Bernardino"
              width="1280"
              height="285"
              sizes="100vw"
              style={{
                width: '100%',
                height: 'auto',
              }}
            />
            <Image
              key={7}
              src={PanoramaSanSalvatore}
              alt="Photo of San Salvatore"
              width="1280"
              height="285"
              sizes="100vw"
              style={{
                width: '100%',
                height: 'auto',
              }}
            />
            <Image
              key={8}
              src={PanoramaTamaroLemaDry}
              alt="Photo of Tamaro-Lema Hike"
              width="1280"
              height="285"
              sizes="100vw"
              style={{
                width: '100%',
                height: 'auto',
              }}
            />
            <Image
              key={9}
              src={PanoramaTamaroLemaLugano}
              alt="Photo of Tamaro-Lema Hike, View of Lugano"
              width="1280"
              height="285"
              sizes="100vw"
              style={{
                width: '100%',
                height: 'auto',
              }}
            />
            <Image
              key={10}
              src={PanoramaUSI}
              alt="Photo of USI"
              width="1280"
              height="285"
              sizes="100vw"
              style={{
                width: '100%',
                height: 'auto',
              }}
            />
          </Carousel>
          <p>
            Lugano is full of hotels, many of them within walking distance from USI.
            Some examples are&nbsp;
            <a href="https://www.hotelcitylugano.ch/">Hotel City</a>
            , right next to campus,&nbsp;
            <a href="https://www.hotellido-lugano.com/en/">Hotel Lido Seegarten</a>
            , at the lake front, and&nbsp;
            <a href="https://www.hotelzurigo.ch/">Hotel Zurigo Downtown</a>
            &nbsp;and&nbsp;
            <a href="https://www.pestalozzi-lugano.ch/en/">Hotel Pestalozzi</a>
            , in the city center.
            And the&nbsp;
            <a href="https://www.youthhostel.ch/en/hostels/lugano">Youth Hostel Lugano Savosa</a>
            &nbsp;has a swimming pool and palm trees,
            and includes breakfast!
            Like a hotel, but unlike AirBnBs, it also includes a&nbsp;
            <a href="https://www.ticino.ch/en/ticket.html">Ticino Ticket</a>
            &nbsp;for free public transportation within Ticino.
          </p>
        </Container>

        <Container maxWidth="lg">
          <Typography align="center" marginY={3}>
            For more information contact&nbsp;
            <a href="mailto:Matthias.Hauswirth@usi.ch">Matthias.Hauswirth@usi.ch</a>
            .
          </Typography>
        </Container>

      </Box>
    </div>
  );
}
