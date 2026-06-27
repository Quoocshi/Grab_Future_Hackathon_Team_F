package com.hubride.module.address.repository;

import com.hubride.module.address.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface AddressRepository extends JpaRepository<Address, UUID> {

    @Query("SELECT a FROM Address a WHERE LOWER(a.label) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(a.fullAddress) LIKE LOWER(CONCAT('%', :q, '%')) ORDER BY CASE a.kind WHEN 'HUB' THEN 0 WHEN 'POPULAR' THEN 1 ELSE 2 END LIMIT :limit")
    List<Address> search(@Param("q") String q, @Param("limit") int limit);

    List<Address> findByKind(String kind);
}
