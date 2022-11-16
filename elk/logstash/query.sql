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
			product_detail.id as pd_id, product_detail.`type` as pd_type, product_detail.option1 as pd_option1, product_detail.option2 as pd_option2,
			product_detail.option3 as pd_option3,product_detail.option4 as pd_option4, product_detail.option5 as pd_option5, product_detail.option6 as pd_option6,
			product_detail.option7 as pd_option7, product_detail.option8 as pd_option8, product_detail.option9 as pd_option9, product_detail.option10 as pd_option10,
			product_detail.option11 as pd_option11, product_detail.option12 as pd_option12, product_detail.option13 as pd_option13, product_detail.option14 as pd_option14,
			product_detail.productId as pd_productId,
			unix_timestamp(product.updatedat) as updatedat
      from product
      left join user on user.id=userId
      left join product_detail on product.id=productId
      where unix_timestamp(product.updatedat) > :sql_last_value 
      order by updatedat asc;


    
-- MySql용 원본 (database명 zero9. 붙음)
-- select product.id, name, originprice, quantity,
--       discountRate, discountPrice, issoldout, delivery,
--       endtype, validfrom, validuntil, images,
--       detailimages, content, product.option1, product.option2, product.option3, product.option4, product.option5,
--       youtubelink, shopname, ceo, brn, mobn, userId,
--       skin, color,
--       product.createdat, product.deletedat, zero9.`user`.id as user_id, zero9.`user`.email as user_email, zero9.`user`.userType as user_Type,
--       zero9.user.nickname as user_nickname, zero9.user.phoneNumber as user_phoneNumber, zero9.user.zipcode as user_zipcode, zero9.user.address
-- 			as user_address, zero9.user.addressDetail as user_addressDeatil, zero9.user.profileImg as user_profileImg, zero9.user.creatorAuthImg as user_creatorAuthImg,
-- 			zero9.user.isAuthedCreator as user_isAuthedCreator, zero9.user.snsName as user_SnsName, zero9.user.followerNumber as user_FollwerNumber,
-- 			zero9.user.mainContents as user_MainContents, zero9.user.introduce as user_introduce, zero9.user.bank as user_bank, zero9.user.account as user_account,
-- 			zero9.user.accountName as user_accountName, zero9.user.point as user_point, zero9.user.createdAt as user_CreatedAt, zero9.user.updatedAt as user_updatedAt,
-- 			zero9.user.deletedAt as user_deletedAt,
-- 			zero9.product_detail.id as pd_id, zero9.product_detail.`type` as pd_type, zero9.product_detail.option1 as pd_option1, zero9.product_detail.option2 as pd_option2,
-- 			zero9.product_detail.option3 as pd_option3,zero9.product_detail.option4 as pd_option4, zero9.product_detail.option5 as pd_option5, zero9.product_detail.option6 as pd_option6,
-- 			zero9.product_detail.option7 as pd_option7, zero9.product_detail.option8 as pd_option8, zero9.product_detail.option9 as pd_option9, zero9.product_detail.option10 as pd_option10,
-- 			zero9.product_detail.option11 as pd_option11, zero9.product_detail.option12 as pd_option12, zero9.product_detail.option13 as pd_option13, zero9.product_detail.option14 as pd_option14,
-- 			zero9.product_detail.productId as pd_productId,
-- 			unix_timestamp(product.updatedat) as updatedat
--       from zero9.product
--       left join zero9.user on userId=userId
--       left join zero9.product_detail on userId=userId
--       where unix_timestamp(product.updatedat)
--       order by updatedat asc;

