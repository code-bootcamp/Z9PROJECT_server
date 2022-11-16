select product.id, name, originprice, quantity,
      discountRate, discountPrice, issoldout, delivery,
      endtype, validfrom, validuntil, images,
      detailimages, content, product.option1, product.option2, product.option3, product.option4, product.option5,
      youtubelink, shopname, ceo, brn, mobn, userId,
      skin, color,
      product.createdat, product.deletedat, `user`.id as user_id, `user`.email as user_email, `user`.userType as user_Type,
      user.nickname as user_nickname, user.phoneNumber as user_phoneNumber, user.zipcode as user_zipcode, user.address
			as user_address, user.addressDetail as user_addressDeatil, user.profileImg as user_profileImg, user.creatorAuthImg as user_creatorAuthImg,
			user.isAuthedCreator as user_isAuthedCreator, user.snsName as user_SnsName, user.followerNumber as user_FollwerNumber,
			user.mainContents as user_MainContents, user.introduce as user_introduce, user.bank as user_bank, user.account as user_account,
			user.accountName as user_accountName, user.point as user_point, user.createdAt as user_CreatedAt, user.updatedAt as user_updatedAt,
			user.deletedAt as user_deletedAt,
			unix_timestamp(product.updatedat) as updatedat
      from product
      left join user on user.id=userId
      where unix_timestamp(product.updatedat) > :sql_last_value 
      order by updatedat asc;

