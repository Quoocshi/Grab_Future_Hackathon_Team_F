package com.hubride.module.room.service;

import com.uber.h3core.H3Core;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.util.List;

@Service
public class H3GeoService {

    private static final int H3_RESOLUTION = 9;
    private static final int K_RING = 2;
    private final H3Core h3;

    public H3GeoService() {
        try {
            this.h3 = H3Core.newInstance();
        } catch (IOException e) {
            throw new RuntimeException("Failed to initialize H3", e);
        }
    }

    public String latLngToCell(double lat, double lng) {
        return h3.latLngToCellAddress(lat, lng, H3_RESOLUTION);
    }

    public List<String> gridDisk(String h3Index) {
        return h3.gridDisk(h3Index, K_RING);
    }

    public double haversineKm(double lat1, double lng1, double lat2, double lng2) {
        final double R = 6371.0;
        double lat1Rad = Math.toRadians(lat1);
        double lat2Rad = Math.toRadians(lat2);
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(lat1Rad) * Math.cos(lat2Rad)
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    public double estimateRouteKm(double lat1, double lng1, double lat2, double lng2) {
        return haversineKm(lat1, lng1, lat2, lng2) * 1.20;
    }

    public double straightLineKm(double lat1, double lng1, double lat2, double lng2) {
        return haversineKm(lat1, lng1, lat2, lng2);
    }

    public int estimateEtaMinutes(double distanceKm) {
        return (int) Math.round((distanceKm / 25.0) * 60);
    }
}
