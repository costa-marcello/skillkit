# Entity Relationship Diagrams - Patterns

Real-world schema examples, best practices, and common database design patterns.

<example name="Blog Platform">

## Blog Platform Schema

```mermaid
erDiagram
    USER ||--o{ POST : creates
    USER ||--o{ COMMENT : writes
    POST ||--o{ COMMENT : receives
    POST }o--o{ TAG : tagged_with
    POST ||--o{ POST_TAG : has
    TAG ||--o{ POST_TAG : applied_to
    POST }o--|| CATEGORY : "belongs to"
    USER ||--o{ LIKE : gives
    POST ||--o{ LIKE : receives
    COMMENT ||--o{ LIKE : receives

    USER {
        bigint id PK "AUTO_INCREMENT"
        varchar email UK "NOT NULL"
        varchar username UK "NOT NULL"
        varchar password_hash "NOT NULL"
        varchar display_name
        text bio
        varchar avatar_url
        timestamp created_at "DEFAULT NOW()"
        timestamp last_login
    }

    POST {
        bigint id PK "AUTO_INCREMENT"
        bigint user_id FK "NOT NULL"
        bigint category_id FK
        varchar title "NOT NULL"
        varchar slug UK "NOT NULL"
        text content "NOT NULL"
        text excerpt
        varchar featured_image_url
        varchar status "NOT NULL DEFAULT 'draft'"
        int view_count "DEFAULT 0"
        timestamp published_at
        timestamp created_at "DEFAULT NOW()"
        timestamp updated_at
    }

    COMMENT {
        bigint id PK "AUTO_INCREMENT"
        bigint user_id FK "NOT NULL"
        bigint post_id FK "NOT NULL"
        bigint parent_comment_id FK "NULL"
        text content "NOT NULL"
        varchar status "DEFAULT 'pending'"
        timestamp created_at "DEFAULT NOW()"
    }

    CATEGORY {
        bigint id PK "AUTO_INCREMENT"
        varchar name UK "NOT NULL"
        varchar slug UK "NOT NULL"
        text description
        bigint parent_id FK
    }

    TAG {
        bigint id PK "AUTO_INCREMENT"
        varchar name UK "NOT NULL"
        varchar slug UK "NOT NULL"
    }

    POST_TAG {
        bigint post_id FK "NOT NULL"
        bigint tag_id FK "NOT NULL"
    }

    LIKE {
        bigint id PK "AUTO_INCREMENT"
        bigint user_id FK "NOT NULL"
        varchar likeable_type "NOT NULL"
        bigint likeable_id "NOT NULL"
        timestamp created_at "DEFAULT NOW()"
    }
```

</example>

<example name="Social Media">

## Social Media Schema

```mermaid
erDiagram
    USER ||--o{ POST : creates
    USER ||--o{ FOLLOW : follows
    USER ||--o{ FOLLOW : "followed by"
    POST ||--o{ LIKE : receives
    POST ||--o{ COMMENT : has
    USER ||--o{ LIKE : gives
    USER ||--o{ COMMENT : makes
    USER ||--o{ NOTIFICATION : receives
    POST ||--o{ POST_MEDIA : contains
    USER }o--o{ GROUP : "member of"
    USER ||--o{ MESSAGE : sends
    USER ||--o{ MESSAGE : receives

    USER {
        uuid id PK
        varchar username UK "NOT NULL"
        varchar email UK "NOT NULL"
        varchar password_hash "NOT NULL"
        varchar full_name
        text bio
        varchar profile_picture_url
        varchar cover_photo_url
        boolean is_verified "DEFAULT FALSE"
        boolean is_private "DEFAULT FALSE"
        timestamp created_at "DEFAULT NOW()"
    }

    POST {
        uuid id PK
        uuid user_id FK "NOT NULL"
        text content
        varchar visibility "DEFAULT 'public'"
        int likes_count "DEFAULT 0"
        int comments_count "DEFAULT 0"
        int shares_count "DEFAULT 0"
        timestamp created_at "DEFAULT NOW()"
        timestamp edited_at
    }

    POST_MEDIA {
        uuid id PK
        uuid post_id FK "NOT NULL"
        varchar media_type "NOT NULL"
        varchar media_url "NOT NULL"
        int display_order
    }

    FOLLOW {
        uuid id PK
        uuid follower_id FK "NOT NULL"
        uuid following_id FK "NOT NULL"
        timestamp created_at "DEFAULT NOW()"
    }

    LIKE {
        uuid id PK
        uuid user_id FK "NOT NULL"
        uuid post_id FK "NOT NULL"
        timestamp created_at "DEFAULT NOW()"
    }

    COMMENT {
        uuid id PK
        uuid user_id FK "NOT NULL"
        uuid post_id FK "NOT NULL"
        uuid parent_comment_id FK
        text content "NOT NULL"
        int likes_count "DEFAULT 0"
        timestamp created_at "DEFAULT NOW()"
    }

    MESSAGE {
        uuid id PK
        uuid sender_id FK "NOT NULL"
        uuid receiver_id FK "NOT NULL"
        text content "NOT NULL"
        boolean is_read "DEFAULT FALSE"
        timestamp created_at "DEFAULT NOW()"
        timestamp read_at
    }

    NOTIFICATION {
        uuid id PK
        uuid user_id FK "NOT NULL"
        varchar notification_type "NOT NULL"
        text content "NOT NULL"
        boolean is_read "DEFAULT FALSE"
        varchar related_entity_type
        uuid related_entity_id
        timestamp created_at "DEFAULT NOW()"
    }

    GROUP {
        uuid id PK
        varchar name "NOT NULL"
        text description
        uuid created_by FK "NOT NULL"
        boolean is_private "DEFAULT FALSE"
        timestamp created_at "DEFAULT NOW()"
    }
```

</example>

## Best Practices

1. **Name entities in UPPERCASE** - Convention for clarity
2. **Use singular names** - `USER` not `USERS`, `ORDER` not `ORDERS`
3. **Define all constraints** - Document PKs, FKs, UKs, NOT NULL
4. **Show cardinality accurately** - Be precise about one-to-many vs many-to-many
5. **Include timestamps** - created_at, updated_at for auditing
6. **Document computed columns** - Mark calculated/derived values
7. **Add meaningful comments** - Use quotes for constraints and descriptions
8. **Consider junction tables** - Explicitly model many-to-many relationships
9. **Use appropriate types** - Match database-specific types
10. **Show indexes** - Document UK (unique keys) beyond PKs

## Common Patterns

<example name="Self-Referencing">

### Self-Referencing (Hierarchical)
```mermaid
erDiagram
    CATEGORY ||--o{ CATEGORY : "parent of"

    CATEGORY {
        uuid id PK
        varchar name "NOT NULL"
        uuid parent_id FK "NULLABLE"
    }
```

</example>

<example name="Junction Table">

### Junction Table (Many-to-Many)
```mermaid
erDiagram
    STUDENT }o--o{ COURSE : enrolls
    STUDENT ||--o{ ENROLLMENT : has
    COURSE ||--o{ ENROLLMENT : includes

    STUDENT {
        uuid id PK
        varchar name "NOT NULL"
    }

    ENROLLMENT {
        uuid student_id FK PK
        uuid course_id FK PK
        date enrolled_date
        varchar grade
    }

    COURSE {
        uuid id PK
        varchar title "NOT NULL"
    }
```

</example>

<example name="Polymorphic">

### Polymorphic Relationship
```mermaid
erDiagram
    COMMENT {
        uuid id PK
        uuid user_id FK
        varchar commentable_type "NOT NULL"
        uuid commentable_id "NOT NULL"
        text content
    }

    POST {
        uuid id PK
        varchar title
    }

    VIDEO {
        uuid id PK
        varchar title
    }
```

</example>

<example name="Soft Deletes">

### Soft Deletes
```mermaid
erDiagram
    USER {
        uuid id PK
        varchar email UK
        varchar name
        timestamp deleted_at "NULLABLE"
    }
```

</example>

<example name="Audit Trail">

### Audit Trail
```mermaid
erDiagram
    DOCUMENT ||--o{ DOCUMENT_VERSION : has

    DOCUMENT {
        uuid id PK
        varchar title "NOT NULL"
        int current_version "DEFAULT 1"
    }

    DOCUMENT_VERSION {
        uuid id PK
        uuid document_id FK "NOT NULL"
        int version_number "NOT NULL"
        text content "NOT NULL"
        uuid modified_by FK
        timestamp created_at "DEFAULT NOW()"
    }
```

</example>

## Tips for Database Design

1. **Normalize appropriately** - Balance normalization with query performance
2. **Use surrogate keys** - UUID or auto-increment integers as PKs
3. **Index foreign keys** - Essential for join performance
4. **Plan for soft deletes** - Add deleted_at columns instead of hard deletes
5. **Version critical data** - Maintain history for important entities
6. **Set appropriate defaults** - created_at, status, boolean flags
7. **Consider denormalization** - Counts and cached values for performance
8. **Use enum/check constraints** - Enforce valid values at database level
