// ImagesPage.jsx
import React from 'react';
import { Container, Grid, Card, CardMedia, CardContent, Typography } from '@mui/material';

const images = [
  {
    title: 'Image 1',
    description: 'This is the first image',
    url: 'https://via.placeholder.com/150',
  },
  {
    title: 'Image 2',
    description: 'This is the second image',
    url: 'https://via.placeholder.com/150',
  },
  {
    title: 'Image 3',
    description: 'This is the third image',
    url: 'https://via.placeholder.com/150',
  },
];

const ImagePage = () => {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Images Page
      </Typography>
      <Grid container spacing={4}>
        {images.map((image, index) => (
          <Grid item key={index} xs={12} sm={6} md={4}>
            <Card>
              <CardMedia
                component="img"
                alt={image.title}
                height="140"
                image={image.url}
              />
              <CardContent>
                <Typography variant="h5" component="div">
                  {image.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {image.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ImagePage;