window.HPC_BACKSTAGE_COORDINATES = {
  cityFallback(city) {
    const key = String(city || '').trim().toLowerCase();
    const places = {
      'lake wales': [27.9014, -81.5859],
      'lakeland': [28.0395, -81.9498],
      'winter haven': [28.0222, -81.7329],
      'bartow': [27.8964, -81.8431],
      'auburndale': [28.0653, -81.7887],
      'hainescity': [28.1142, -81.6179],
      'haines city': [28.1142, -81.6179],
      'frostproof': [27.7459, -81.5306],
      'fort meade': [27.7523, -81.8017],
      'mulberry': [27.8953, -81.9734],
      'davenport': [28.1614, -81.6017],
      'polk city': [28.1825, -81.8234]
    };
    const value = places[key] || [27.9014, -81.5859];
    return { latitude: value[0], longitude: value[1] };
  },

  applyToBusiness(business) {
    if (!business) return business;
    if (business.latitude && business.longitude) return business;
    const coords = this.cityFallback(business.city || 'Lake Wales');
    business.latitude = coords.latitude;
    business.longitude = coords.longitude;
    return business;
  }
};
